<?php
// File Location: includes/api/api-master-data.php

if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_MasterData {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/master-data', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_items' ),
            'permission_callback' => '__return_true',
        ) );
        register_rest_route( 'umh/v1', '/master-data', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'create_item' ),
            'permission_callback' => '__return_true',
        ) );
        register_rest_route( 'umh/v1', '/master-data/(?P<id>\d+)', array(
            'methods'             => 'DELETE',
            'callback'            => array( $this, 'delete_item' ),
            'permission_callback' => '__return_true',
        ) );
    }

    public function get_items( $request ) {
        global $wpdb;
        $type = $request->get_param('type'); // airline, hotel
        $table = $wpdb->prefix . 'umh_master_data';

        $sql = "SELECT * FROM $table WHERE 1=1";
        if($type) {
            $sql .= $wpdb->prepare(" AND type = %s", $type);
        }
        $sql .= " ORDER BY name ASC";

        $results = $wpdb->get_results($sql);
        return rest_ensure_response($results);
    }

    public function create_item( $request ) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_master_data';

        $data = array(
            'type' => sanitize_text_field($params['type']),
            'name' => sanitize_text_field($params['name']),
            'details' => sanitize_textarea_field($params['details']),
            'created_at' => current_time('mysql')
        );

        $wpdb->insert($table, $data);
        return rest_ensure_response(array('id' => $wpdb->insert_id, 'message' => 'Data berhasil disimpan'));
    }

    public function delete_item( $request ) {
        global $wpdb;
        $id = $request['id'];
        $table = $wpdb->prefix . 'umh_master_data';
        
        $wpdb->delete($table, array('id' => $id));
        return rest_ensure_response(array('message' => 'Data dihapus'));
    }
}

new UMH_API_MasterData();