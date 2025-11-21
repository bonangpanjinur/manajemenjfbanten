<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Categories {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/categories', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true']
        ]);
        register_rest_route( 'umh/v1', '/categories/(?P<id>\d+)', [
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_items() {
        global $wpdb;
        // Ambil parent dan child, lalu format di frontend atau kirim flat
        $results = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}umh_categories ORDER BY parent_id ASC, name ASC" );
        return rest_ensure_response( $results );
    }

    public function create_item( $request ) {
        global $wpdb;
        $p = $request->get_json_params();
        
        $name = sanitize_text_field( $p['name'] );
        $parent_id = isset($p['parent_id']) ? intval($p['parent_id']) : 0; // Support Sub Kategori
        $slug = sanitize_title( $name );

        if ( empty( $name ) ) return new WP_Error( 'missing_name', 'Nama wajib diisi', ['status' => 400] );

        $wpdb->insert( $wpdb->prefix . 'umh_categories', [
            'name' => $name,
            'parent_id' => $parent_id,
            'slug' => $slug,
            'created_at' => current_time('mysql')
        ]);

        return rest_ensure_response( ['id' => $wpdb->insert_id, 'message' => 'Kategori berhasil disimpan'] );
    }

    public function delete_item( $request ) {
        global $wpdb;
        $id = $request['id'];
        // Cek dependencies (anak kategori atau paket)
        $wpdb->delete( $wpdb->prefix . 'umh_categories', ['id' => $id] );
        // Reset parent_id anak-anaknya menjadi 0 (root)
        $wpdb->update( $wpdb->prefix . 'umh_categories', ['parent_id' => 0], ['parent_id' => $id] );
        
        return rest_ensure_response( ['message' => 'Kategori dihapus'] );
    }
}
new UMH_API_Categories();