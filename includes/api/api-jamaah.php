<?php
/**
 * API Handler untuk Manajemen Data Jamaah
 * Endpoint: /wp-json/umh/v1/jamaah
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_API_Jamaah {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $namespace = 'umh/v1';
        $base      = 'jamaah';

        // GET: Ambil daftar jamaah (Support Filter & Search)
        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_jamaah_list' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // GET: Ambil detail 1 jamaah
        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_jamaah_detail' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // POST: Input Jamaah Baru
        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array( $this, 'create_jamaah' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // PUT: Update Data Jamaah
        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array( $this, 'update_jamaah' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // DELETE: Hapus Jamaah
        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array( $this, 'delete_jamaah' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    public function check_permission() {
        // Idealnya nanti cek capability custom: current_user_can('manage_jamaah')
        return current_user_can( 'manage_options' ) || is_user_logged_in();
    }

    /**
     * GET LIST JAMAAH
     * Filter: ?package_id=1&search=Agus&status_bayar=lunas
     */
    public function get_jamaah_list( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        
        $where = "WHERE 1=1";
        $args = array();

        // 1. Filter by Package
        if ( $request->get_param( 'package_id' ) ) {
            $where .= " AND package_id = %d";
            $args[] = (int) $request->get_param( 'package_id' );
        }

        // 2. Filter by Payment Status (Lunas/Belum)
        if ( $request->get_param( 'payment_status' ) ) {
            $where .= " AND payment_status = %s";
            $args[] = sanitize_text_field( $request->get_param( 'payment_status' ) );
        }

        // 3. Search (Nama atau No Paspor)
        if ( $request->get_param( 'search' ) ) {
            $search = '%' . $wpdb->esc_like( $request->get_param( 'search' ) ) . '%';
            $where .= " AND (full_name LIKE %s OR passport_number LIKE %s)";
            $args[] = $search;
            $args[] = $search;
        }

        // 4. Filter Bulan Keberangkatan (Advanced)
        // Butuh join ke tabel packages untuk cek departure_date
        if ( $request->get_param( 'month' ) ) { // Format: '2025-03'
            $month_year = $request->get_param( 'month' );
            $table_pkg = $wpdb->prefix . 'umh_packages';
            // Subquery atau Join
            $where .= " AND package_id IN (SELECT id FROM $table_pkg WHERE departure_date LIKE %s)";
            $args[] = $month_year . '%';
        }

        $query = "SELECT * FROM $table $where ORDER BY created_at DESC";
        
        if ( ! empty( $args ) ) {
            $results = $wpdb->get_results( $wpdb->prepare( $query, $args ) );
        } else {
            $results = $wpdb->get_results( $query );
        }

        // Enrichment Data
        foreach ( $results as $row ) {
            $row->address_details = json_decode( $row->address_details );
            $row->document_status = json_decode( $row->document_status );
            // Hitung umur on the fly
            $row->age = $this->calculate_age( $row->birth_date );
            // Hitung sisa pembayaran
            $row->remaining_payment = (float)$row->package_price - (float)$row->total_paid;
            // Ambil nama paket
            $row->package_name = $this->get_package_name( $row->package_id );
            // PIC Name
            $row->pic_name = get_the_author_meta( 'display_name', $row->pic_id );
        }

        return rest_ensure_response( $results );
    }

    /**
     * CREATE JAMAAH
     * Otomatis set harga paket berdasarkan Room Type
     */
    public function create_jamaah( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';

        // --- 1. Ambil Data Paket untuk Snapshot Harga ---
        $package_id = (int) $request->get_param( 'package_id' );
        $room_type  = sanitize_text_field( $request->get_param( 'selected_room_type' ) ); // 'Quad', 'Quint', 'Double'
        
        $pkg_table = $wpdb->prefix . 'umh_packages';
        $package = $wpdb->get_row( $wpdb->prepare( "SELECT pricing_variants FROM $pkg_table WHERE id = %d", $package_id ) );

        if ( ! $package ) {
            return new WP_Error( 'invalid_package', 'Paket tidak ditemukan', array( 'status' => 400 ) );
        }

        // Cari harga di dalam JSON pricing_variants
        $variants = json_decode( $package->pricing_variants, true );
        $deal_price = 0;
        
        // Fallback jika JSON error atau format salah
        if ( is_array( $variants ) ) {
            foreach ( $variants as $v ) {
                // Match logic: cari key 'type' atau 'name' yang sesuai request
                if ( (isset($v['type']) && strtolower($v['type']) == strtolower($room_type)) || 
                     (isset($v['name']) && strtolower($v['name']) == strtolower($room_type)) ) {
                    $deal_price = (float) $v['price'];
                    break;
                }
            }
        }

        if ( $deal_price == 0 ) {
            return new WP_Error( 'invalid_room', 'Tipe kamar tidak valid atau harga tidak ditemukan di paket ini.', array( 'status' => 400 ) );
        }

        // --- 2. Sanitasi Input Lainnya ---
        $data = array(
            'package_id'         => $package_id,
            'selected_room_type' => $room_type,
            'package_price'      => $deal_price, // Snapshot Harga!
            'full_name'          => sanitize_text_field( $request->get_param( 'full_name' ) ),
            'gender'             => sanitize_text_field( $request->get_param( 'gender' ) ),
            'birth_date'         => sanitize_text_field( $request->get_param( 'birth_date' ) ),
            'passport_number'    => sanitize_text_field( $request->get_param( 'passport_number' ) ),
            'passport_issued_date' => sanitize_text_field( $request->get_param( 'passport_issued_date' ) ),
            'passport_expiry_date' => sanitize_text_field( $request->get_param( 'passport_expiry_date' ) ),
            'phone_number'       => sanitize_text_field( $request->get_param( 'phone_number' ) ),
            'pic_id'             => (int) $request->get_param( 'pic_id' ), // ID User login / Sub agent
            'files_ktp'          => esc_url_raw( $request->get_param( 'files_ktp' ) ),
            'files_kk'           => esc_url_raw( $request->get_param( 'files_kk' ) ),
            'files_passport'     => esc_url_raw( $request->get_param( 'files_passport' ) ),
            'kit_status'         => 'pending',
            'payment_status'     => 'unpaid',
            'total_paid'         => 0,
            'created_by'         => get_current_user_id(),
        );

        // JSON Fields
        $address_details = $request->get_param( 'address_details' ); // {prov: 'Banten', city: 'Serang', ...}
        $data['address_details'] = json_encode( $address_details );

        $doc_status = $request->get_param( 'document_status' ); // {ktp: true, passport: false}
        $data['document_status'] = json_encode( $doc_status );

        // Validasi Wajib
        if ( empty( $data['full_name'] ) ) {
            return new WP_Error( 'missing_name', 'Nama Lengkap wajib diisi', array( 'status' => 400 ) );
        }

        $inserted = $wpdb->insert( $table, $data );

        if ( $inserted ) {
            return rest_ensure_response( array( 
                'id' => $wpdb->insert_id, 
                'message' => 'Jamaah berhasil didaftarkan',
                'deal_price' => $deal_price 
            ) );
        }

        return new WP_Error( 'db_error', 'Gagal menyimpan data jamaah: ' . $wpdb->last_error, array( 'status' => 500 ) );
    }

    /**
     * UPDATE JAMAAH
     */
    public function update_jamaah( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $id = $request->get_param( 'id' );

        $data = array();
        $format = array();

        // Mapping field yang boleh diupdate
        $allow_fields = array(
            'full_name' => '%s', 'gender' => '%s', 'birth_date' => '%s',
            'passport_number' => '%s', 'passport_issued_date' => '%s', 'passport_expiry_date' => '%s',
            'phone_number' => '%s', 'kit_status' => '%s', 
            'files_ktp' => '%s', 'files_kk' => '%s', 'files_passport' => '%s'
        );

        foreach ( $allow_fields as $key => $fmt ) {
            if ( $request->has_param( $key ) ) {
                $data[$key] = sanitize_text_field( $request->get_param( $key ) );
                $format[] = $fmt;
            }
        }

        // Handle JSON updates
        if ( $request->has_param( 'address_details' ) ) {
            $data['address_details'] = json_encode( $request->get_param( 'address_details' ) );
            $format[] = '%s';
        }
        if ( $request->has_param( 'document_status' ) ) {
            $data['document_status'] = json_encode( $request->get_param( 'document_status' ) );
            $format[] = '%s';
        }

        // Khusus update harga paket (hanya admin level tinggi yang boleh, opsional)
        // if ( $request->has_param( 'package_price' ) && current_user_can('administrator') ) ...

        if ( empty( $data ) ) {
            return new WP_Error( 'no_data', 'Tidak ada data update', array( 'status' => 400 ) );
        }

        $updated = $wpdb->update( $table, $data, array( 'id' => $id ), $format, array( '%d' ) );

        if ( $updated !== false ) {
            return rest_ensure_response( array( 'message' => 'Data jamaah diperbarui' ) );
        }

        return new WP_Error( 'db_error', 'Gagal update database', array( 'status' => 500 ) );
    }

    /**
     * DELETE JAMAAH
     */
    public function delete_jamaah( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $id = $request->get_param( 'id' );

        // Cek apakah ada pembayaran?
        $pay_count = $wpdb->get_var( $wpdb->prepare( 
            "SELECT COUNT(*) FROM {$wpdb->prefix}umh_payments WHERE jamaah_id = %d", $id 
        ) );

        if ( $pay_count > 0 ) {
            return new WP_Error( 'has_payment', 'Jamaah tidak bisa dihapus karena memiliki riwayat pembayaran. Silakan hapus pembayaran terlebih dahulu atau tandai sebagai batal.', array( 'status' => 400 ) );
        }

        $deleted = $wpdb->delete( $table, array( 'id' => $id ), array( '%d' ) );

        if ( $deleted ) {
            return rest_ensure_response( array( 'message' => 'Data jamaah dihapus' ) );
        }

        return new WP_Error( 'db_error', 'Gagal menghapus data', array( 'status' => 500 ) );
    }

    public function get_jamaah_detail( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $id = $request->get_param( 'id' );

        $jamaah = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );

        if ( ! $jamaah ) {
            return new WP_Error( 'not_found', 'Jamaah tidak ditemukan', array( 'status' => 404 ) );
        }

        // Decode & Calculate
        $jamaah->address_details = json_decode( $jamaah->address_details );
        $jamaah->document_status = json_decode( $jamaah->document_status );
        $jamaah->age = $this->calculate_age( $jamaah->birth_date );
        $jamaah->remaining_payment = (float)$jamaah->package_price - (float)$jamaah->total_paid;
        
        // Package Info (Bisa join atau fetch terpisah)
        $jamaah->package_name = $this->get_package_name( $jamaah->package_id );
        
        return rest_ensure_response( $jamaah );
    }

    // --- HELPERS ---
    private function calculate_age( $birth_date ) {
        if ( empty( $birth_date ) ) return 0;
        $dob = new DateTime( $birth_date );
        $now = new DateTime();
        $diff = $now->diff( $dob );
        return $diff->y;
    }

    private function get_package_name( $id ) {
        global $wpdb;
        return $wpdb->get_var( $wpdb->prepare( "SELECT name FROM {$wpdb->prefix}umh_packages WHERE id = %d", $id ) );
    }
}

new UMH_API_Jamaah();