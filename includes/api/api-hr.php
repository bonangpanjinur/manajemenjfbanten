<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_HR {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/employees', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true']
        ]);
        register_rest_route( 'umh/v1', '/employees/(?P<id>\d+)', [
            ['methods' => 'PUT', 'callback' => [$this, 'update_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_items() {
        global $wpdb;
        $results = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}umh_employees ORDER BY name ASC" );
        return rest_ensure_response( $results );
    }

    public function create_item( $request ) {
        global $wpdb;
        $p = $request->get_json_params();

        $wpdb->insert( $wpdb->prefix . 'umh_employees', [
            'name' => sanitize_text_field($p['name']),
            'position' => sanitize_text_field($p['position']), // Jabatan Dinamis
            'phone' => sanitize_text_field($p['phone']),
            'email' => sanitize_email($p['email']),
            'salary' => floatval($p['salary']),
            'status' => sanitize_text_field($p['status']) ?: 'active',
            'created_at' => current_time('mysql')
        ]);

        return rest_ensure_response( ['message' => 'Karyawan ditambahkan', 'id' => $wpdb->insert_id] );
    }

    public function update_item( $request ) {
        global $wpdb;
        $id = $request['id'];
        $p = $request->get_json_params();

        $wpdb->update( $wpdb->prefix . 'umh_employees', [
            'name' => sanitize_text_field($p['name']),
            'position' => sanitize_text_field($p['position']),
            'phone' => sanitize_text_field($p['phone']),
            'email' => sanitize_email($p['email']),
            'salary' => floatval($p['salary']),
            'status' => sanitize_text_field($p['status'])
        ], ['id' => $id] );

        return rest_ensure_response( ['message' => 'Data karyawan diperbarui'] );
    }

    public function delete_item( $request ) {
        global $wpdb;
        $wpdb->delete( $wpdb->prefix . 'umh_employees', ['id' => $request['id']] );
        return rest_ensure_response( ['message' => 'Karyawan dihapus'] );
    }
}
new UMH_API_HR();