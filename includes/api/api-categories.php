<?php
// File Location: includes/api/api-categories.php

if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Categories {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/categories', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_items' ),
            'permission_callback' => '__return_true',
        ) );
        register_rest_route( 'umh/v1', '/categories', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'create_item' ),
            'permission_callback' => '__return_true',
        ) );
        register_rest_route( 'umh/v1', '/categories/(?P<id>\d+)', array(
            'methods'             => 'DELETE',
            'callback'            => array( $this, 'delete_item' ),
            'permission_callback' => '__return_true',
        ) );
    }

    public function get_items() {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_categories';
        $results = $wpdb->get_results( "SELECT * FROM $table ORDER BY parent_id ASC, name ASC" );
        return rest_ensure_response( $results );
    }

    public function create_item( $request ) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_categories';

        $name = sanitize_text_field( $params['name'] );
        $parent_id = isset($params['parent_id']) ? intval($params['parent_id']) : 0;
        $slug = sanitize_title( $name );

        if ( empty( $name ) ) {
            return new WP_Error( 'missing_name', 'Nama kategori wajib diisi', array( 'status' => 400 ) );
        }

        $wpdb->insert( $table, array( 
            'name' => $name, 
            'parent_id' => $parent_id,
            'slug' => $slug,
            'created_at' => current_time('mysql')
        ));

        return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Kategori berhasil dibuat' ) );
    }

    public function delete_item( $request ) {
        global $wpdb;
        $id = $request['id'];
        $table = $wpdb->prefix . 'umh_categories';

        // Cek jika digunakan di paket
        $check = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->prefix}umh_packages WHERE category_id = %d OR sub_category_id = %d", $id, $id ) );
        
        if ( $check > 0 ) {
            return new WP_Error( 'used_data', 'Kategori sedang digunakan oleh Paket dan tidak bisa dihapus.', array( 'status' => 400 ) );
        }

        $wpdb->delete( $table, array( 'id' => $id ) );
        return rest_ensure_response( array( 'message' => 'Kategori dihapus' ) );
    }
}

new UMH_API_Categories();