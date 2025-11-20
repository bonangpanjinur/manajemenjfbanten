<?php
/**
 * API Handler untuk Manajemen Paket Umroh
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_API_Packages {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $namespace = 'umh/v1';
        $base      = 'packages';

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
        // Menggunakan helper dari utils.php jika ada, atau fallback ke native
        if ( function_exists( 'umh_check_api_permission' ) ) {
            return umh_check_api_permission( $request );
        }
        return current_user_can( 'manage_options' );
    }

    // --- GET ITEMS ---
    public function get_items( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        
        $where = "WHERE 1=1";
        $args = array();

        // Filter Status
        if ( $status = $request->get_param( 'status' ) ) {
            $where .= " AND status = %s";
            $args[] = sanitize_text_field( $status );
        } else {
            // Default jangan tampilkan arsip kecuali diminta
            $where .= " AND status != 'archived'";
        }

        // Filter Pencarian
        if ( $search = $request->get_param( 'search' ) ) {
            $term = '%' . $wpdb->esc_like( $search ) . '%';
            $where .= " AND name LIKE %s";
            $args[] = $term;
        }

        // Filter Kategori
        if ( $cat = $request->get_param( 'category_id' ) ) {
            $where .= " AND category_id = %d";
            $args[] = (int)$cat;
        }

        $query = "SELECT * FROM $table $where ORDER BY departure_date ASC";
        
        if ( ! empty( $args ) ) {
            $results = $wpdb->get_results( $wpdb->prepare( $query, $args ) );
        } else {
            $results = $wpdb->get_results( $query );
        }

        // Format JSON fields
        foreach ( $results as $row ) {
            $row->hotels = json_decode( $row->hotels );
            $row->pricing_variants = json_decode( $row->pricing_variants );
            
            // Hitung sisa seat (opsional, butuh query ke tabel jamaah)
            $row->total_registered = $wpdb->get_var( $wpdb->prepare( 
                "SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE package_id = %d", $row->id 
            ) );
        }

        return rest_ensure_response( $results );
    }

    // --- GET SINGLE ITEM ---
    public function get_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = (int) $request->get_param( 'id' );

        $item = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );

        if ( ! $item ) {
            return new WP_Error( 'not_found', 'Paket tidak ditemukan', array( 'status' => 404 ) );
        }

        $item->hotels = json_decode( $item->hotels );
        $item->pricing_variants = json_decode( $item->pricing_variants );

        return rest_ensure_response( $item );
    }

    // --- CREATE ITEM ---
    public function create_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';

        // 1. Validasi Input Wajib
        $required = ['name', 'departure_date', 'category_id', 'airline_id'];
        foreach ($required as $field) {
            if ( empty( $request->get_param( $field ) ) ) {
                return new WP_Error( 'missing_field', "Field $field wajib diisi.", array( 'status' => 400 ) );
            }
        }

        // 2. Validasi & Sanitasi
        $data = array(
            'name'            => sanitize_text_field( $request->get_param( 'name' ) ),
            'category_id'     => (int) $request->get_param( 'category_id' ),
            'sub_category_id' => (int) $request->get_param( 'sub_category_id' ),
            'departure_date'  => sanitize_text_field( $request->get_param( 'departure_date' ) ),
            'airline_id'      => (int) $request->get_param( 'airline_id' ),
            'status'          => sanitize_text_field( $request->get_param( 'status' ) ) ?: 'active',
            'itinerary_file'  => esc_url_raw( $request->get_param( 'itinerary_file' ) ),
        );

        // 3. Validasi Struktur JSON (Hotels & Prices)
        $hotels = $request->get_param( 'hotels' );
        $prices = $request->get_param( 'pricing_variants' );

        if ( empty( $hotels ) || empty( $prices ) ) {
            return new WP_Error( 'invalid_json', 'Data Hotel dan Varian Harga wajib diisi.', array( 'status' => 400 ) );
        }

        $data['hotels'] = is_string( $hotels ) ? $hotels : json_encode( $hotels );
        $data['pricing_variants'] = is_string( $prices ) ? $prices : json_encode( $prices );

        $inserted = $wpdb->insert( $table, $data );

        if ( $inserted ) {
            return rest_ensure_response( array( 
                'id' => $wpdb->insert_id, 
                'message' => 'Paket berhasil dibuat.' 
            ) );
        }

        return new WP_Error( 'db_error', 'Gagal menyimpan paket.', array( 'status' => 500 ) );
    }

    // --- UPDATE ITEM ---
    public function update_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = (int) $request->get_param( 'id' );

        // Cek eksistensi
        $exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE id = %d", $id ) );
        if ( ! $exists ) return new WP_Error( 'not_found', 'Paket tidak ditemukan', array( 'status' => 404 ) );

        $data = array();
        $params = $request->get_params();
        
        // Mapping field yang boleh diupdate
        $allowed = ['name', 'category_id', 'sub_category_id', 'departure_date', 'airline_id', 'status', 'itinerary_file'];
        
        foreach ( $allowed as $key ) {
            if ( isset( $params[$key] ) ) {
                $data[$key] = sanitize_text_field( $params[$key] );
            }
        }

        // Handle JSON fields khusus
        if ( isset( $params['hotels'] ) ) {
            $data['hotels'] = is_string( $params['hotels'] ) ? $params['hotels'] : json_encode( $params['hotels'] );
        }
        if ( isset( $params['pricing_variants'] ) ) {
            $data['pricing_variants'] = is_string( $params['pricing_variants'] ) ? $params['pricing_variants'] : json_encode( $params['pricing_variants'] );
        }

        if ( empty( $data ) ) return new WP_Error( 'no_changes', 'Tidak ada data yang diubah.', array( 'status' => 400 ) );

        $updated = $wpdb->update( $table, $data, array( 'id' => $id ) );

        if ( $updated !== false ) {
            return rest_ensure_response( array( 'message' => 'Paket berhasil diperbarui.' ) );
        }

        return new WP_Error( 'db_error', 'Gagal update paket.', array( 'status' => 500 ) );
    }

    // --- DELETE ITEM ---
    public function delete_item( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = (int) $request->get_param( 'id' );

        // 1. Referential Integrity Check
        $jamaah_count = $wpdb->get_var( $wpdb->prepare( 
            "SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE package_id = %d", $id 
        ) );

        if ( $jamaah_count > 0 ) {
            return new WP_Error( 'dependency_error', "Gagal: Masih ada $jamaah_count Jamaah yang terdaftar di paket ini. Silakan pindahkan mereka atau arsipkan paket ini.", array( 'status' => 409 ) );
        }

        $deleted = $wpdb->delete( $table, array( 'id' => $id ) );

        if ( $deleted ) {
            return rest_ensure_response( array( 'message' => 'Paket berhasil dihapus.' ) );
        }

        return new WP_Error( 'db_error', 'Gagal menghapus paket.', array( 'status' => 500 ) );
    }
}

new UMH_API_Packages();