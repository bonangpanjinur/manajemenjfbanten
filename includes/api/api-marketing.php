<?php
/**
 * API Handler untuk Marketing (Leads Management)
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_API_Marketing {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $namespace = 'umh/v1';
        $base      = 'leads';

        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_items' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array( $this, 'create_item' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array( $this, 'update_item' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array( $this, 'delete_item' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    public function check_permission( $request ) {
        if ( function_exists( 'umh_check_api_permission' ) ) {
            return umh_check_api_permission( $request );
        }
        return current_user_can( 'manage_options' );
    }

    public function get_items( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_leads';
        
        $where = "WHERE 1=1";
        $args = array();

        if ( $status = $request->get_param( 'status' ) ) {
            $where .= " AND status = %s";
            $args[] = sanitize_text_field( $status );
        }

        // Filter milik user sendiri (jika bukan admin)
        $current_user = wp_get_current_user();
        if ( ! in_array( 'administrator', $current_user->roles ) ) {
            // Contoh logika: staff marketing hanya lihat leads mereka
            // $where .= " AND assigned_to = %d";
            // $args[] = $current_user->ID;
        }

        $query = "SELECT * FROM $table $where ORDER BY created_at DESC";
        
        if ( ! empty( $args ) ) {
            $results = $wpdb->get_results( $wpdb->prepare( $query, $args ) );
        } else {
            $results = $wpdb->get_results( $query );
        }

        return rest_ensure_response( $results );
    }

    public function create_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_leads';

        $name = sanitize_text_field( $request->get_param( 'name' ) );
        $phone = sanitize_text_field( $request->get_param( 'phone' ) );

        if ( empty( $name ) || empty( $phone ) ) {
            return new WP_Error( 'missing_field', 'Nama dan Nomor HP Calon Jamaah wajib diisi.', array( 'status' => 400 ) );
        }

        $data = array(
            'name'        => $name,
            'phone'       => $phone,
            'email'       => sanitize_email( $request->get_param( 'email' ) ),
            'source'      => sanitize_text_field( $request->get_param( 'source' ) ) ?: 'manual',
            'status'      => 'new',
            'notes'       => sanitize_textarea_field( $request->get_param( 'notes' ) ),
            'assigned_to' => get_current_user_id()
        );

        if ( $wpdb->insert( $table, $data ) ) {
            return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Leads berhasil dibuat' ) );
        }
        return new WP_Error( 'db_error', 'Gagal menyimpan leads.', array( 'status' => 500 ) );
    }

    public function update_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_leads';
        $id = (int) $request->get_param( 'id' );

        $data = array();
        if ( $request->has_param( 'status' ) ) $data['status'] = sanitize_text_field( $request->get_param( 'status' ) );
        if ( $request->has_param( 'notes' ) ) $data['notes'] = sanitize_textarea_field( $request->get_param( 'notes' ) );
        if ( $request->has_param( 'name' ) ) $data['name'] = sanitize_text_field( $request->get_param( 'name' ) );
        if ( $request->has_param( 'phone' ) ) $data['phone'] = sanitize_text_field( $request->get_param( 'phone' ) );

        if ( empty( $data ) ) return new WP_Error( 'no_data', 'Tidak ada data update.', array( 'status' => 400 ) );

        if ( $wpdb->update( $table, $data, array( 'id' => $id ) ) !== false ) {
            return rest_ensure_response( array( 'message' => 'Leads diperbarui' ) );
        }
        return new WP_Error( 'db_error', 'Gagal update.', array( 'status' => 500 ) );
    }

    public function delete_item( $request ) {
        global $wpdb;
        $id = (int) $request->get_param( 'id' );
        if ( $wpdb->delete( $wpdb->prefix . 'umh_leads', array( 'id' => $id ) ) ) {
            return rest_ensure_response( array( 'message' => 'Leads dihapus' ) );
        }
        return new WP_Error( 'db_error', 'Gagal hapus.', array( 'status' => 500 ) );
    }
}
new UMH_API_Marketing();