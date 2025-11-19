<?php
/**
 * API Handler untuk Manajemen Paket Umroh
 * Endpoint: /wp-json/umh/v1/packages
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

        // GET: Ambil semua paket (bisa filter by category, status)
        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_packages' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // GET: Ambil detail 1 paket
        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_package_detail' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // POST: Buat Paket Baru
        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array( $this, 'create_package' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // PUT: Update Paket
        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array( $this, 'update_package' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // DELETE: Hapus Paket
        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array( $this, 'delete_package' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    public function check_permission() {
        // Sementara hanya admin, nanti bisa disesuaikan dengan role staff
        return current_user_can( 'manage_options' );
    }

    /**
     * GET ALL PACKAGES
     * Mendukung parameter ?status=active&category_id=1
     */
    public function get_packages( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        
        // -- Filter Logic --
        $where = "WHERE 1=1";
        $args = array();

        if ( $request->get_param( 'status' ) ) {
            $where .= " AND status = %s";
            $args[] = sanitize_text_field( $request->get_param( 'status' ) );
        }

        if ( $request->get_param( 'category_id' ) ) {
            $where .= " AND category_id = %d";
            $args[] = (int) $request->get_param( 'category_id' );
        }

        // Query Utama
        $sql = "SELECT * FROM $table $where ORDER BY departure_date DESC";
        
        if ( ! empty( $args ) ) {
            $query = $wpdb->prepare( $sql, $args );
        } else {
            $query = $sql;
        }

        $packages = $wpdb->get_results( $query );

        // -- Data Enrichment (Decode JSON & Fetch Relations) --
        // Agar frontend menerima data "matang", kita bisa fetch nama maskapai/kategori di sini
        // Tapi untuk performa, kita decode JSON saja, relasi nama bisa diambil dari context master data di React
        
        foreach ( $packages as $pkg ) {
            // Decode JSON columns
            $pkg->hotels = json_decode( $pkg->hotels ); // Array of IDs e.g. [1, 5]
            $pkg->pricing_variants = json_decode( $pkg->pricing_variants ); // Array of Objects
            
            // Opsional: Ambil nama kategori/maskapai untuk kemudahan display tabel
            $pkg->airline_name = $this->get_master_name($pkg->airline_id, 'airline');
            $pkg->category_name = $this->get_category_name($pkg->category_id);
        }

        return rest_ensure_response( $packages );
    }

    /**
     * GET SINGLE PACKAGE
     */
    public function get_package_detail( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = $request->get_param( 'id' );

        $pkg = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );

        if ( ! $pkg ) {
            return new WP_Error( 'not_found', 'Paket tidak ditemukan', array( 'status' => 404 ) );
        }

        $pkg->hotels = json_decode( $pkg->hotels );
        $pkg->pricing_variants = json_decode( $pkg->pricing_variants );

        return rest_ensure_response( $pkg );
    }

    /**
     * CREATE PACKAGE
     */
    public function create_package( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';

        // Ambil & Sanitasi Input
        $name            = sanitize_text_field( $request->get_param( 'name' ) );
        $category_id     = (int) $request->get_param( 'category_id' );
        $sub_category_id = (int) $request->get_param( 'sub_category_id' );
        $departure_date  = sanitize_text_field( $request->get_param( 'departure_date' ) ); // YYYY-MM-DD
        $airline_id      = (int) $request->get_param( 'airline_id' );
        $itinerary_file  = esc_url_raw( $request->get_param( 'itinerary_file' ) );
        $status          = sanitize_text_field( $request->get_param( 'status' ) ); // active, completed

        // Complex Data (Array/Object dari React)
        $hotels           = $request->get_param( 'hotels' ); // Array ID [1, 2]
        $pricing_variants = $request->get_param( 'pricing_variants' ); // Array Obj [{type:'Quad', price:30000000}]

        // Validasi Dasar
        if ( empty( $name ) || empty( $departure_date ) || empty( $pricing_variants ) ) {
            return new WP_Error( 'missing_fields', 'Nama, Tanggal, dan Harga Wajib diisi', array( 'status' => 400 ) );
        }

        // Encode ke JSON untuk simpan di DB
        $hotels_json = json_encode( $hotels );
        $pricing_json = json_encode( $pricing_variants );

        $inserted = $wpdb->insert(
            $table,
            array(
                'name'             => $name,
                'category_id'      => $category_id,
                'sub_category_id'  => $sub_category_id,
                'departure_date'   => $departure_date,
                'airline_id'       => $airline_id,
                'hotels'           => $hotels_json,
                'pricing_variants' => $pricing_json,
                'itinerary_file'   => $itinerary_file,
                'status'           => $status ?: 'active'
            ),
            array( '%s', '%d', '%d', '%s', '%d', '%s', '%s', '%s', '%s' )
        );

        if ( $inserted ) {
            return rest_ensure_response( array( 
                'id' => $wpdb->insert_id, 
                'message' => 'Paket berhasil dibuat' 
            ) );
        }

        return new WP_Error( 'db_error', 'Gagal menyimpan paket', array( 'status' => 500 ) );
    }

    /**
     * UPDATE PACKAGE
     */
    public function update_package( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = $request->get_param( 'id' );

        $data = array();
        $format = array();

        // Helper mapping input ke kolom DB
        $fields = array(
            'name' => '%s', 'category_id' => '%d', 'sub_category_id' => '%d',
            'departure_date' => '%s', 'airline_id' => '%d', 'status' => '%s', 
            'itinerary_file' => '%s'
        );

        foreach ( $fields as $field => $fmt ) {
            if ( $request->has_param( $field ) ) {
                $data[$field] = $request->get_param( $field );
                $format[] = $fmt;
            }
        }

        // Handle JSON Fields
        if ( $request->has_param( 'hotels' ) ) {
            $data['hotels'] = json_encode( $request->get_param( 'hotels' ) );
            $format[] = '%s';
        }
        if ( $request->has_param( 'pricing_variants' ) ) {
            $data['pricing_variants'] = json_encode( $request->get_param( 'pricing_variants' ) );
            $format[] = '%s';
        }

        if ( empty( $data ) ) {
            return new WP_Error( 'no_change', 'Tidak ada data yang diubah', array( 'status' => 400 ) );
        }

        $updated = $wpdb->update( $table, $data, array( 'id' => $id ), $format, array( '%d' ) );

        if ( $updated !== false ) {
            return rest_ensure_response( array( 'message' => 'Paket berhasil diupdate' ) );
        }

        return new WP_Error( 'db_error', 'Gagal update paket', array( 'status' => 500 ) );
    }

    /**
     * DELETE PACKAGE
     */
    public function delete_package( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = $request->get_param( 'id' );

        // Cek apakah paket sudah ada jamaahnya?
        // Jika ada, sebaiknya jangan dihapus keras, tapi soft delete / arsip.
        $jamaah_count = $wpdb->get_var( $wpdb->prepare( 
            "SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE package_id = %d", $id 
        ) );

        if ( $jamaah_count > 0 ) {
            return new WP_Error( 'has_jamaah', 'Paket tidak bisa dihapus karena sudah ada Jamaah terdaftar.', array( 'status' => 400 ) );
        }

        $deleted = $wpdb->delete( $table, array( 'id' => $id ), array( '%d' ) );

        if ( $deleted ) {
            return rest_ensure_response( array( 'message' => 'Paket dihapus' ) );
        }

        return new WP_Error( 'db_error', 'Gagal menghapus paket', array( 'status' => 500 ) );
    }

    // --- Helpers untuk nama ---
    private function get_master_name($id, $type) {
        global $wpdb;
        if(!$id) return '-';
        $name = $wpdb->get_var( $wpdb->prepare( "SELECT name FROM {$wpdb->prefix}umh_master_data WHERE id = %d AND type = %s", $id, $type ) );
        return $name ?: '-';
    }

    private function get_category_name($id) {
        global $wpdb;
        if(!$id) return '-';
        $name = $wpdb->get_var( $wpdb->prepare( "SELECT name FROM {$wpdb->prefix}umh_categories WHERE id = %d", $id ) );
        return $name ?: '-';
    }
}

new UMH_API_Packages();