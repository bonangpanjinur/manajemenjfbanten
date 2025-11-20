<?php
// File Location: includes/api/api-master-data.php

if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Master_Data {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/master-data', [
            'methods' => 'GET', 'callback' => [$this, 'get_master_data'], 'permission_callback' => '__return_true'
        ]);
        register_rest_route( 'umh/v1', '/master-data', [
            'methods' => 'POST', 'callback' => [$this, 'create_master_data'], 'permission_callback' => '__return_true'
        ]);
        register_rest_route( 'umh/v1', '/master-data/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'delete_master_data'], 'permission_callback' => '__return_true'
        ]);
    }

    public function get_master_data( $request ) {
        global $wpdb;
        $type = sanitize_text_field($request->get_param( 'type' ));
        $sql = "SELECT * FROM {$wpdb->prefix}umh_master_data WHERE 1=1";
        if($type) $sql .= $wpdb->prepare(" AND type = %s", $type);
        $results = $wpdb->get_results($sql);
        foreach($results as $r) { $r->details = json_decode($r->details); }
        return rest_ensure_response($results);
    }

    public function create_master_data( $request ) {
        global $wpdb;
        $params = $request->get_json_params();
        $name = sanitize_text_field($params['name']);
        $type = sanitize_text_field($params['type']);
        
        $details = isset($params['details']) ? $params['details'] : [];
        $details_json = is_string($details) ? $details : json_encode($details);

        $wpdb->insert($wpdb->prefix.'umh_master_data', [
            'name' => $name, 'type' => $type, 'details' => $details_json, 'created_at' => current_time('mysql')
        ]);
        return rest_ensure_response(['id' => $wpdb->insert_id]);
    }

    public function delete_master_data( $request ) {
        global $wpdb;
        $wpdb->delete($wpdb->prefix.'umh_master_data', ['id' => $request['id']]);
        return rest_ensure_response(['message' => 'Terhapus']);
    }
}
new UMH_API_Master_Data();