<?php
if (!defined('ABSPATH')) exit;

class UMH_API_HR {

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        $namespace = 'umh/v1';

        // GET Employees
        register_rest_route($namespace, '/hr/employees', [
            'methods' => 'GET',
            'callback' => array($this, 'get_employees'),
            'permission_callback' => '__return_true'
        ]);

        // POST Bulk Attendance (Checklist Harian)
        register_rest_route($namespace, '/hr/attendance/bulk', [
            'methods' => 'POST',
            'callback' => array($this, 'bulk_attendance'),
            'permission_callback' => '__return_true'
        ]);

        // GET Payroll Preview (Hitung Gaji Otomatis)
        register_rest_route($namespace, '/hr/payroll/preview/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => array($this, 'calculate_payroll'),
            'permission_callback' => '__return_true'
        ]);

        // POST Request Kasbon
        register_rest_route($namespace, '/hr/kasbon', [
            'methods' => 'POST',
            'callback' => array($this, 'create_kasbon'),
            'permission_callback' => '__return_true'
        ]);

        // GET Kasbon List
        register_rest_route($namespace, '/hr/kasbon', [
            'methods' => 'GET',
            'callback' => array($this, 'get_kasbon_list'),
            'permission_callback' => '__return_true'
        ]);
    }

    public function get_employees() {
        global $wpdb;
        // Mengambil user yang bukan jamaah (staff/admin/dll)
        $results = $wpdb->get_results("SELECT id, full_name, email, role, phone, salary_base FROM {$wpdb->prefix}umh_users WHERE role != 'jamaah'");
        return rest_ensure_response($results);
    }

    public function bulk_attendance($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $date = $params['date'] ?: date('Y-m-d');
        $records = $params['records']; // Array [{user_id: 1, status: 'present'}, ...]

        foreach ($records as $rec) {
            // Cek apakah sudah absen hari ini
            $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_attendance WHERE user_id = %d AND date = %s", $rec['user_id'], $date));
            
            if ($existing) {
                $wpdb->update($wpdb->prefix . 'umh_attendance', ['status' => $rec['status']], ['id' => $existing]);
            } else {
                $wpdb->insert($wpdb->prefix . 'umh_attendance', [
                    'user_id' => $rec['user_id'],
                    'date' => $date,
                    'status' => $rec['status']
                ]);
            }
        }
        return rest_ensure_response(['message' => 'Data kehadiran berhasil disimpan.']);
    }

    public function create_kasbon($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        $wpdb->insert($wpdb->prefix . 'umh_cash_advance', [
            'user_id' => $params['user_id'],
            'amount' => $params['amount'],
            'request_date' => date('Y-m-d'),
            'reason' => sanitize_textarea_field($params['reason']),
            'status' => 'pending' 
        ]);
        
        return rest_ensure_response(['message' => 'Pengajuan kasbon berhasil.']);
    }

    public function get_kasbon_list() {
        global $wpdb;
        $sql = "SELECT k.*, u.full_name FROM {$wpdb->prefix}umh_cash_advance k JOIN {$wpdb->prefix}umh_users u ON k.user_id = u.id ORDER BY k.created_at DESC";
        return $wpdb->get_results($sql);
    }

    // LOGIKA UTAMA: Hitung Gaji - Potongan Absen - Kasbon
    public function calculate_payroll($request) {
        global $wpdb;
        $user_id = $request['id'];
        $month = $request->get_param('month') ?: date('Y-m'); // format '2023-10'

        // 1. Ambil Gaji Pokok
        $user = $wpdb->get_row($wpdb->prepare("SELECT full_name, salary_base FROM {$wpdb->prefix}umh_users WHERE id = %d", $user_id));
        if (!$user) return new WP_Error('no_user', 'User not found', ['status' => 404]);
        
        $salary_base = (float)$user->salary_base;

        // 2. Hitung Absensi (Alpha/Absent)
        // Misal: Potongan per alpha = 100.000 (Bisa dibuat dinamis di settings nanti)
        $penalty_per_absent = 100000; 
        $absent_count = (int)$wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}umh_attendance WHERE user_id = %d AND status = 'absent' AND date LIKE %s", 
            $user_id, $month . '%'
        ));
        $attendance_deduction = $absent_count * $penalty_per_absent;

        // 3. Hitung Kasbon (Hanya yang status 'approved' dan di bulan yang sama atau belum lunas)
        // Sederhananya: Total kasbon approved bulan ini dipotong gaji bulan ini
        $kasbon_total = (float)$wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM {$wpdb->prefix}umh_cash_advance WHERE user_id = %d AND status = 'approved' AND request_date LIKE %s",
            $user_id, $month . '%'
        ));

        $total_salary = $salary_base - $attendance_deduction - $kasbon_total;

        return rest_ensure_response([
            'user_id' => $user_id,
            'full_name' => $user->full_name,
            'period' => $month,
            'salary_base' => $salary_base,
            'deductions' => [
                'absent_days' => $absent_count,
                'attendance_penalty' => $attendance_deduction,
                'kasbon' => $kasbon_total
            ],
            'total_salary' => max(0, $total_salary) // Tidak boleh minus
        ]);
    }
}
new UMH_API_HR();