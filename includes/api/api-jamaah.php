<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Jamaah {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Route ini sekarang lebih tepat disebut "Bookings" tapi kita pertahankan nama endpoint agar frontend tidak banyak berubah
        register_rest_route( 'umh/v1', '/jamaah', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true']
        ]);
        
        register_rest_route( 'umh/v1', '/jamaah/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'PUT', 'callback' => [$this, 'update_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_items( $request ) {
        global $wpdb;
        $search = $request->get_param('search');
        $status = $request->get_param('status');
        
        // JOIN 3 Tabel: Bookings -> Jamaah -> Packages
        // Kita mengambil data Booking sebagai entitas utama di list ini
        $sql = "SELECT 
                    b.id as booking_id, 
                    b.booking_code, 
                    b.status as booking_status,
                    b.kit_status,
                    b.visa_status,
                    j.id as jamaah_id,
                    j.full_name, 
                    j.passport_number,
                    j.phone_number,
                    p.name as package_name,
                    p.departure_date
                FROM {$wpdb->prefix}umh_bookings b
                JOIN {$wpdb->prefix}umh_jamaah j ON b.jamaah_id = j.id
                LEFT JOIN {$wpdb->prefix}umh_packages p ON b.package_id = p.id
                WHERE 1=1";

        if($search) {
            $sql .= $wpdb->prepare(" AND (j.full_name LIKE %s OR b.booking_code LIKE %s OR j.passport_number LIKE %s)", "%$search%", "%$search%", "%$search%");
        }
        
        if($status && $status !== 'all') {
            $sql .= $wpdb->prepare(" AND b.status = %s", $status);
        }

        $sql .= " ORDER BY b.created_at DESC";
        
        $results = $wpdb->get_results($sql);
        return rest_ensure_response($results);
    }

    public function create_item( $request ) {
        global $wpdb;
        $p = $request->get_json_params();
        
        $wpdb->query('START TRANSACTION');

        try {
            // 1. HANDLE JAMAAH (PROFILE)
            // Cek apakah jamaah sudah ada berdasarkan NIK atau Paspor
            $existing_jamaah = null;
            if (!empty($p['passport_number'])) {
                $existing_jamaah = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_jamaah WHERE passport_number = %s", $p['passport_number']));
            } elseif (!empty($p['nik'])) {
                $existing_jamaah = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_jamaah WHERE nik = %s", $p['nik']));
            }

            $jamaah_id = 0;

            if ($existing_jamaah) {
                // Update data jamaah existing jika diperlukan
                $jamaah_id = $existing_jamaah->id;
                $wpdb->update($wpdb->prefix . 'umh_jamaah', [
                    'full_name' => sanitize_text_field($p['full_name']),
                    'phone_number' => sanitize_text_field($p['phone_number']),
                    'address_details' => isset($p['address']) ? json_encode($p['address']) : null
                ], ['id' => $jamaah_id]);
            } else {
                // Buat Jamaah Baru
                $wpdb->insert($wpdb->prefix . 'umh_jamaah', [
                    'full_name' => sanitize_text_field($p['full_name']),
                    'nik' => sanitize_text_field($p['nik'] ?? ''),
                    'passport_number' => sanitize_text_field($p['passport_number'] ?? ''),
                    'gender' => sanitize_text_field($p['gender']),
                    'birth_date' => $p['birth_date'],
                    'phone_number' => sanitize_text_field($p['phone_number']),
                    'email' => sanitize_email($p['email'] ?? ''),
                    'address_details' => isset($p['address']) ? json_encode($p['address']) : null,
                    'created_at' => current_time('mysql')
                ]);
                $jamaah_id = $wpdb->insert_id;
            }

            if (!$jamaah_id) throw new Exception("Gagal memproses data Jamaah");

            // 2. HANDLE BOOKING (TRANSAKSI)
            // Generate Kode Booking Unik
            $booking_code = 'BOOK-' . date('ymd') . '-' . rand(100, 999);
            
            $wpdb->insert($wpdb->prefix . 'umh_bookings', [
                'booking_code' => $booking_code,
                'jamaah_id' => $jamaah_id,
                'package_id' => intval($p['package_id']),
                'selected_room_type' => sanitize_text_field($p['room_type']), // Quad/Triple/Double
                'agreed_price' => floatval($p['price']),
                'status' => 'booked',
                'agent_id' => isset($p['agent_id']) ? intval($p['agent_id']) : null,
                'created_at' => current_time('mysql')
            ]);

            $booking_id = $wpdb->insert_id;

            if (!$booking_id) throw new Exception("Gagal membuat Booking");

            $wpdb->query('COMMIT');
            return rest_ensure_response(['id' => $booking_id, 'message' => 'Jamaah berhasil didaftarkan', 'code' => $booking_code]);

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('db_error', $e->getMessage(), ['status' => 500]);
        }
    }

    public function get_item($request) {
        global $wpdb;
        $id = $request['id']; // Ini adalah BOOKING ID
        
        $booking = $wpdb->get_row($wpdb->prepare("
            SELECT b.*, j.*, p.name as package_name 
            FROM {$wpdb->prefix}umh_bookings b
            JOIN {$wpdb->prefix}umh_jamaah j ON b.jamaah_id = j.id
            LEFT JOIN {$wpdb->prefix}umh_packages p ON b.package_id = p.id
            WHERE b.id = %d
        ", $id));

        if($booking) {
            $booking->address_details = json_decode($booking->address_details);
            $booking->files_data = json_decode($booking->files_data);
        }

        return rest_ensure_response($booking);
    }
    
    public function update_item($request) {
        // Implementasi update status booking, dll
        return rest_ensure_response(['message' => 'Update logic here']);
    }
    
    public function delete_item($request) {
        global $wpdb;
        $id = $request['id'];
        $wpdb->delete($wpdb->prefix . 'umh_bookings', ['id' => $id]);
        return rest_ensure_response(['message' => 'Booking dihapus']);
    }
}
new UMH_API_Jamaah();