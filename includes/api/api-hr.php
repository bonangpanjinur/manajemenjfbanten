<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_HR {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Endpoint untuk Laporan Harian
        register_rest_route( 'umh/v1', '/reports', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'create_daily_report' ),
            'permission_callback' => '__return_true', 
        ) );

        register_rest_route( 'umh/v1', '/hr/employees', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_employees' ),
            'permission_callback' => '__return_true',
        ) );
    }

    public function create_daily_report( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_work_reports';
        
        $params = $request->get_json_params();
        $user_id = isset($params['user_id']) ? intval($params['user_id']) : 0;
        $content = isset($params['content']) ? sanitize_textarea_field($params['content']) : '';

        if( empty($content) || $user_id === 0 ) {
            return new WP_Error('missing_data', 'User ID dan Isi Laporan wajib diisi', ['status'=>400]);
        }

        $data = [
            'user_id'     => $user_id,
            'report_date' => current_time('Y-m-d'),
            'content'     => $content,
            'created_at'  => current_time('mysql')
        ];

        if ( $wpdb->insert( $table, $data ) ) {
            return rest_ensure_response( ['message' => 'Laporan harian berhasil dikirim'] );
        }
        return new WP_Error('db_error', 'Gagal mengirim laporan', ['status'=>500]);
    }

    public function get_employees() {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_users';
        $results = $wpdb->get_results( "SELECT id, full_name, role, email, phone FROM $table WHERE status='active'" );
        return rest_ensure_response($results);
    }
}
new UMH_API_HR();