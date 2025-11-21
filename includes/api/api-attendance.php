<?php
if (!defined('ABSPATH')) exit;

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_API_Attendance extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_attendance');
    }

    public function register_routes() {
        // 1. Cek Status Presensi Hari Ini
        register_rest_route('umh/v1', '/attendance/today', [
            'methods' => 'GET',
            'callback' => [$this, 'get_today_status'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        // 2. Melakukan Presensi (Check In / Check Out)
        register_rest_route('umh/v1', '/attendance/clock', [
            'methods' => 'POST',
            'callback' => [$this, 'clock_action'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        // 3. Riwayat Presensi User
        register_rest_route('umh/v1', '/attendance/history', [
            'methods' => 'GET',
            'callback' => [$this, 'get_user_history'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }

    public function get_today_status($request) {
        global $wpdb;
        $user_id = get_current_user_id(); // Asumsi menggunakan Auth WP
        $today = current_time('Y-m-d');

        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE user_id = %d AND date = %s",
            $user_id, $today
        ));

        if ($row) {
            return rest_ensure_response([
                'status' => 'checked_in',
                'data' => $row,
                'can_check_out' => is_null($row->check_out_time)
            ]);
        }

        return rest_ensure_response([
            'status' => 'not_checked_in',
            'data' => null
        ]);
    }

    public function clock_action($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        $type = $request['type']; // 'in' atau 'out'
        $lat = sanitize_text_field($request['lat']);
        $lng = sanitize_text_field($request['lng']);
        $today = current_time('Y-m-d');
        $now = current_time('mysql');

        if (empty($lat) || empty($lng)) {
            return new WP_Error('no_location', 'Lokasi GPS wajib diaktifkan.', ['status' => 400]);
        }

        // Cek apakah sudah ada data hari ini
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT id, check_out_time FROM {$this->table_name} WHERE user_id = %d AND date = %s",
            $user_id, $today
        ));

        if ($type === 'in') {
            if ($existing) {
                return new WP_Error('already_in', 'Anda sudah absen masuk hari ini.', ['status' => 400]);
            }

            // Insert Check In
            $wpdb->insert($this->table_name, [
                'user_id' => $user_id,
                'date' => $today,
                'check_in_time' => $now,
                'check_in_lat' => $lat,
                'check_in_lng' => $lng,
                'status' => 'present'
            ]);

            return rest_ensure_response(['message' => 'Berhasil Absen Masuk', 'time' => $now]);
        } 
        
        if ($type === 'out') {
            if (!$existing) {
                return new WP_Error('not_in', 'Anda belum absen masuk.', ['status' => 400]);
            }
            if ($existing->check_out_time) {
                return new WP_Error('already_out', 'Anda sudah absen pulang hari ini.', ['status' => 400]);
            }

            // Update Check Out
            $wpdb->update($this->table_name, [
                'check_out_time' => $now,
                'check_out_lat' => $lat,
                'check_out_lng' => $lng
            ], ['id' => $existing->id]);

            return rest_ensure_response(['message' => 'Berhasil Absen Pulang', 'time' => $now]);
        }
    }

    public function get_user_history($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        
        $query = "SELECT * FROM {$this->table_name} WHERE user_id = %d ORDER BY date DESC LIMIT 30";
        $items = $wpdb->get_results($wpdb->prepare($query, $user_id));

        return rest_ensure_response($items);
    }
}