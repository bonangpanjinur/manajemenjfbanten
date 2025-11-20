<?php
// File Location: includes/api/api-packages.php

if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Packages {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/packages', [
            'methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'
        ]);
        register_rest_route( 'umh/v1', '/packages', [
            'methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true' // Ganti permission sesuai kebutuhan
        ]);
        register_rest_route( 'umh/v1', '/packages/(?P<id>\d+)', [
            'methods' => 'PUT', 'callback' => [$this, 'update_item'], 'permission_callback' => '__return_true'
        ]);
        register_rest_route( 'umh/v1', '/packages/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true'
        ]);
    }

    public function get_items( $request ) {
        global $wpdb;
        $status = $request->get_param('status');
        $sql = "SELECT p.*, c.name as category_name 
                FROM {$wpdb->prefix}umh_packages p 
                LEFT JOIN {$wpdb->prefix}umh_categories c ON p.category_id = c.id 
                WHERE 1=1";
        
        if($status) $sql .= $wpdb->prepare(" AND p.status = %s", $status);
        
        $sql .= " ORDER BY p.departure_date ASC";
        $results = $wpdb->get_results($sql);

        foreach($results as $row) {
            // Decode JSON hotels & pricing
            $row->hotels = json_decode($row->hotels); 
            $row->pricing_variants = json_decode($row->pricing_variants);
        }
        return rest_ensure_response($results);
    }

    public function create_item( $request ) {
        global $wpdb;
        $params = $request->get_json_params();

        $data = [
            'name' => sanitize_text_field($params['name']),
            'category_id' => intval($params['category_id']),
            'sub_category_id' => intval($params['sub_category_id']),
            'departure_date' => $params['departure_date'],
            'airline_id' => intval($params['airline_id']),
            'status' => $params['status'],
            'itinerary_file' => esc_url_raw($params['itinerary_file']),
            // Simpan array sebagai JSON
            'hotels' => json_encode($params['hotels']), 
            'pricing_variants' => json_encode($params['pricing_variants']),
            'created_at' => current_time('mysql')
        ];

        $wpdb->insert($wpdb->prefix . 'umh_packages', $data);
        return rest_ensure_response(['id' => $wpdb->insert_id, 'message' => 'Paket berhasil dibuat']);
    }

    public function update_item( $request ) {
        global $wpdb;
        $id = $request['id'];
        $params = $request->get_json_params();

        $data = [
            'name' => sanitize_text_field($params['name']),
            'category_id' => intval($params['category_id']),
            'sub_category_id' => intval($params['sub_category_id']),
            'departure_date' => $params['departure_date'],
            'airline_id' => intval($params['airline_id']),
            'status' => $params['status'],
            'itinerary_file' => esc_url_raw($params['itinerary_file']),
            'hotels' => json_encode($params['hotels']), 
            'pricing_variants' => json_encode($params['pricing_variants']),
        ];

        $wpdb->update($wpdb->prefix . 'umh_packages', $data, ['id' => $id]);
        return rest_ensure_response(['message' => 'Paket diperbarui']);
    }

    public function delete_item( $request ) {
        global $wpdb;
        $wpdb->delete($wpdb->prefix . 'umh_packages', ['id' => $request['id']]);
        return rest_ensure_response(['message' => 'Paket dihapus']);
    }
}
new UMH_API_Packages();