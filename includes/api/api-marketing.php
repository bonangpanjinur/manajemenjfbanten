<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Marketing {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Route: /umh/v1/leads
        register_rest_route( 'umh/v1', '/leads', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_items( $request ) {
        global $wpdb;
        $results = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}umh_leads ORDER BY created_at DESC" );
        return rest_ensure_response( $results );
    }

    public function create_item( $request ) {
        global $wpdb;
        $p = $request->get_json_params();

        // Validasi sederhana
        if ( empty($p['name']) || empty($p['contact']) ) {
            return new WP_Error( 'missing_data', 'Nama dan Kontak wajib diisi', ['status' => 400] );
        }

        // Cek apakah ini update atau insert
        if ( !empty($p['id']) ) {
            // UPDATE
            $wpdb->update( $wpdb->prefix . 'umh_leads', [
                'name' => sanitize_text_field($p['name']),
                'contact' => sanitize_text_field($p['contact']),
                'source' => sanitize_text_field($p['source']),
                'status' => sanitize_text_field($p['status']),
                'notes' => sanitize_textarea_field($p['notes'])
            ], ['id' => $p['id']] );
            return rest_ensure_response( ['message' => 'Lead berhasil diperbarui'] );
        } else {
            // INSERT
            $wpdb->insert( $wpdb->prefix . 'umh_leads', [
                'name' => sanitize_text_field($p['name']),
                'contact' => sanitize_text_field($p['contact']),
                'source' => sanitize_text_field($p['source']),
                'status' => sanitize_text_field($p['status']) ?: 'new',
                'notes' => sanitize_textarea_field($p['notes']),
                'created_at' => current_time('mysql')
            ]);
            return rest_ensure_response( ['message' => 'Lead berhasil ditambahkan', 'id' => $wpdb->insert_id] );
        }
    }

    public function delete_item( $request ) {
        global $wpdb;
        $id = $request->get_param('id');
        
        if ( empty($id) ) return new WP_Error('no_id', 'ID tidak ditemukan', ['status' => 400]);

        $deleted = $wpdb->delete( $wpdb->prefix . 'umh_leads', ['id' => $id] );
        
        if ( $deleted ) {
            return rest_ensure_response( ['message' => 'Lead dihapus'] );
        }
        return new WP_Error('delete_failed', 'Gagal menghapus data', ['status' => 500]);
    }
}
new UMH_API_Marketing();