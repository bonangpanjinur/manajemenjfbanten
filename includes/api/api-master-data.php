<?php
/**
 * API Handler untuk Master Data (Hotel, Maskapai, dll) & Kategori
 * * Endpoints:
 * 1. Master Data: /wp-json/umh/v1/master-data
 * 2. Categories: /wp-json/umh/v1/categories
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_API_Master_Data {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $namespace = 'umh/v1';

        // --- ROUTE: MASTER DATA (Hotel, Maskapai, dll) ---
        
        // GET: Ambil data (bisa filter ?type=hotel)
        register_rest_route( $namespace, '/master-data', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_master_data' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // POST: Tambah data baru
        register_rest_route( $namespace, '/master-data', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array( $this, 'create_master_data' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // PUT: Update data
        register_rest_route( $namespace, '/master-data/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array( $this, 'update_master_data' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // DELETE: Hapus data
        register_rest_route( $namespace, '/master-data/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array( $this, 'delete_master_data' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );


        // --- ROUTE: KATEGORI (Umroh/Haji) ---

        // GET: Ambil Kategori
        register_rest_route( $namespace, '/categories', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_categories' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // POST: Tambah Kategori
        register_rest_route( $namespace, '/categories', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array( $this, 'create_category' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // DELETE: Hapus Kategori
        register_rest_route( $namespace, '/categories/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array( $this, 'delete_category' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    // --- PERMISSIONS ---
    public function check_permission() {
        // Hanya user dengan capability 'manage_options' (Admin) yang bisa akses
        // Nanti bisa disesuaikan dengan role custom jika sudah dibuat
        return current_user_can( 'manage_options' );
    }

    // --- LOGIC: MASTER DATA ---

    public function get_master_data( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_data';
        
        $type = $request->get_param( 'type' ); // hotel, airline, equipment
        
        if ( $type ) {
            $query = $wpdb->prepare( "SELECT * FROM $table WHERE type = %s ORDER BY name ASC", $type );
        } else {
            $query = "SELECT * FROM $table ORDER BY type ASC, name ASC";
        }

        $results = $wpdb->get_results( $query );

        // Decode JSON details agar siap pakai di React
        foreach ( $results as $row ) {
            $row->details = json_decode( $row->details );
        }

        return rest_ensure_response( $results );
    }

    public function create_master_data( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_data';

        $name = sanitize_text_field( $request->get_param( 'name' ) );
        $type = sanitize_text_field( $request->get_param( 'type' ) ); // 'hotel', 'airline'
        $details = $request->get_param( 'details' ); // Array/Object dari React

        if ( empty( $name ) || empty( $type ) ) {
            return new WP_Error( 'missing_fields', 'Nama dan Tipe wajib diisi', array( 'status' => 400 ) );
        }

        // Encode details kembali ke JSON untuk disimpan
        $details_json = !empty($details) ? json_encode( $details ) : null;

        $inserted = $wpdb->insert(
            $table,
            array(
                'name'    => $name,
                'type'    => $type,
                'details' => $details_json,
            ),
            array( '%s', '%s', '%s' )
        );

        if ( $inserted ) {
            return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Data berhasil disimpan' ) );
        }

        return new WP_Error( 'db_error', 'Gagal menyimpan ke database', array( 'status' => 500 ) );
    }

    public function update_master_data( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_data';
        $id = $request->get_param( 'id' );

        $data = array();
        $format = array();

        if ( $request->get_param( 'name' ) ) {
            $data['name'] = sanitize_text_field( $request->get_param( 'name' ) );
            $format[] = '%s';
        }
        if ( $request->get_param( 'details' ) ) {
            $data['details'] = json_encode( $request->get_param( 'details' ) );
            $format[] = '%s';
        }

        if ( empty( $data ) ) {
            return new WP_Error( 'no_data', 'Tidak ada data yang diupdate', array( 'status' => 400 ) );
        }

        $updated = $wpdb->update( $table, $data, array( 'id' => $id ), $format, array( '%d' ) );

        if ( $updated !== false ) {
            return rest_ensure_response( array( 'message' => 'Data berhasil diupdate' ) );
        }

        return new WP_Error( 'db_error', 'Gagal update database', array( 'status' => 500 ) );
    }

    public function delete_master_data( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_data';
        $id = $request->get_param( 'id' );

        $deleted = $wpdb->delete( $table, array( 'id' => $id ), array( '%d' ) );

        if ( $deleted ) {
            return rest_ensure_response( array( 'message' => 'Data dihapus' ) );
        }

        return new WP_Error( 'db_error', 'Gagal menghapus data', array( 'status' => 500 ) );
    }

    // --- LOGIC: CATEGORIES ---

    public function get_categories( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_categories';
        
        // Ambil semua kategori
        $query = "SELECT * FROM $table ORDER BY parent_id ASC, name ASC";
        $results = $wpdb->get_results( $query );

        // Opsional: Anda bisa menyusun struktur Tree (Parent-Child) di sini atau di React
        // Untuk sekarang kita kirim raw data saja agar fleksibel
        return rest_ensure_response( $results );
    }

    public function create_category( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_categories';

        $name = sanitize_text_field( $request->get_param( 'name' ) );
        $parent_id = (int) $request->get_param( 'parent_id' );
        
        // Buat Slug otomatis
        $slug = sanitize_title( $name );

        if ( empty( $name ) ) {
            return new WP_Error( 'missing_name', 'Nama Kategori wajib diisi', array( 'status' => 400 ) );
        }

        $inserted = $wpdb->insert(
            $table,
            array(
                'name'      => $name,
                'slug'      => $slug,
                'parent_id' => $parent_id
            ),
            array( '%s', '%s', '%d' )
        );

        if ( $inserted ) {
            return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Kategori berhasil dibuat' ) );
        }

        return new WP_Error( 'db_error', 'Gagal membuat kategori', array( 'status' => 500 ) );
    }

    public function delete_category( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_categories';
        $id = $request->get_param( 'id' );

        // Cek apakah kategori ini punya anak (sub-kategori)?
        $children = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE parent_id = %d", $id ) );
        if ( $children > 0 ) {
            return new WP_Error( 'has_children', 'Tidak bisa menghapus kategori induk yang memiliki sub-kategori.', array( 'status' => 400 ) );
        }

        // Cek apakah kategori dipakai di Paket? (Optional, but good practice)
        // $used = $wpdb->get_var(...) 

        $deleted = $wpdb->delete( $table, array( 'id' => $id ), array( '%d' ) );

        if ( $deleted ) {
            return rest_ensure_response( array( 'message' => 'Kategori dihapus' ) );
        }

        return new WP_Error( 'db_error', 'Gagal menghapus kategori', array( 'status' => 500 ) );
    }

}

// Inisialisasi Class
new UMH_API_Master_Data();