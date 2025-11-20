<?php
/**
 * API Handler untuk Manajemen Sub Agen
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_API_Sub_Agents {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $namespace = 'umh/v1';
        $base      = 'sub-agents';

        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_items' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_item' ),
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
        $table = $wpdb->prefix . 'umh_sub_agents';
        
        $where = "WHERE 1=1";
        $args = array();

        if ( $search = $request->get_param( 'search' ) ) {
            $term = '%' . $wpdb->esc_like( $search ) . '%';
            $where .= " AND (name LIKE %s OR phone LIKE %s OR city LIKE %s)";
            $args[] = $term;
            $args[] = $term;
            $args[] = $term;
        }

        $query = "SELECT * FROM $table $where ORDER BY name ASC";
        
        if ( ! empty( $args ) ) {
            $results = $wpdb->get_results( $wpdb->prepare( $query, $args ) );
        } else {
            $results = $wpdb->get_results( $query );
        }

        return rest_ensure_response( $results );
    }

    public function get_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_sub_agents';
        $id = (int) $request->get_param( 'id' );
        $item = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
        return $item ? rest_ensure_response( $item ) : new WP_Error( 'not_found', 'Agen tidak ditemukan', array( 'status' => 404 ) );
    }

    public function create_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_sub_agents';

        $phone = sanitize_text_field( $request->get_param( 'phone' ) );
        
        // 1. Validasi Duplikat HP
        if ( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE phone = %s", $phone ) ) ) {
            return new WP_Error( 'duplicate', 'Nomor HP sudah terdaftar untuk agen lain.', array( 'status' => 409 ) );
        }

        $data = array(
            'name'            => sanitize_text_field( $request->get_param( 'name' ) ),
            'phone'           => $phone,
            'email'           => sanitize_email( $request->get_param( 'email' ) ),
            'city'            => sanitize_text_field( $request->get_param( 'city' ) ),
            'address'         => sanitize_textarea_field( $request->get_param( 'address' ) ),
            'commission_rate' => (float) $request->get_param( 'commission_rate' ),
            'status'          => 'active'
        );

        if ( empty( $data['name'] ) || empty( $data['phone'] ) ) {
            return new WP_Error( 'missing_field', 'Nama dan Nomor HP wajib diisi.', array( 'status' => 400 ) );
        }

        if ( $wpdb->insert( $table, $data ) ) {
            return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Agen berhasil ditambahkan.' ) );
        }
        return new WP_Error( 'db_error', 'Gagal menyimpan.', array( 'status' => 500 ) );
    }

    public function update_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_sub_agents';
        $id = (int) $request->get_param( 'id' );

        // Cek Duplikat jika ganti HP
        if ( $phone = $request->get_param( 'phone' ) ) {
            $exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE phone = %s AND id != %d", $phone, $id ) );
            if ( $exists ) return new WP_Error( 'duplicate', 'Nomor HP sudah digunakan agen lain.', array( 'status' => 409 ) );
        }

        $data = array();
        $allowed = ['name', 'phone', 'email', 'city', 'address', 'commission_rate', 'status'];
        foreach($allowed as $key) {
            if(isset($request[$key])) $data[$key] = sanitize_text_field($request[$key]);
        }

        if ( $wpdb->update( $table, $data, array( 'id' => $id ) ) !== false ) {
            return rest_ensure_response( array( 'message' => 'Agen diperbarui.' ) );
        }
        return new WP_Error( 'db_error', 'Gagal update.', array( 'status' => 500 ) );
    }

    public function delete_item( $request ) {
        global $wpdb;
        $id = (int) $request->get_param( 'id' );

        // Cek jika agen punya jamaah (di tabel jamaah biasanya ada kolom 'agent_id' atau 'referral_id', 
        // asumsi disini menggunakan kolom 'created_by' atau custom field relasi jika ada.
        // Jika belum ada relasi langsung, kita skip check ini atau tambahkan nanti)
        
        // Contoh placeholder check:
        // $has_jamaah = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE agent_id = %d", $id));
        // if ($has_jamaah) return new WP_Error(...);

        if ( $wpdb->delete( $wpdb->prefix . 'umh_sub_agents', array( 'id' => $id ) ) ) {
            return rest_ensure_response( array( 'message' => 'Agen dihapus.' ) );
        }
        return new WP_Error( 'db_error', 'Gagal hapus.', array( 'status' => 500 ) );
    }
}
new UMH_API_Sub_Agents();