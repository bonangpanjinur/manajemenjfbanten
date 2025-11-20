<?php
// File Location: includes/api/api-tasks.php
if (!defined('ABSPATH')) exit;

class UMH_API_Tasks {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/reports', [
            'methods' => 'POST',
            'callback' => array($this, 'create_daily_report'),
            'permission_callback' => '__return_true' // Sesuaikan permission
        ]);
    }

    public function create_daily_report($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        $data = [
            'user_id' => get_current_user_id() ?: intval($params['user_id']), // Support jika dikirim dari FE
            'report_date' => current_time('Y-m-d'),
            'content' => sanitize_textarea_field($params['content']),
            'created_at' => current_time('mysql')
        ];

        $res = $wpdb->insert($wpdb->prefix . 'umh_work_reports', $data);
        
        if($res) return rest_ensure_response(['message' => 'Laporan harian berhasil disimpan.']);
        return new WP_Error('db_error', 'Gagal menyimpan laporan', ['status' => 500]);
    }
}
new UMH_API_Tasks();