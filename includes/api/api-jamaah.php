<?php
// File Location: includes/api/api-jamaah.php

/**
 * API Handler untuk Manajemen Data Jamaah
 * Fix: Menangani input JSON agar tidak blank
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

        // CRUD Routes
        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_jamaah_list' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_jamaah_detail' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/' . $base, array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'create_jamaah' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => 'PUT',
            'callback'            => array( $this, 'update_jamaah' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
            'methods'             => 'DELETE',
            'callback'            => array( $this, 'delete_jamaah' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    public function check_permission() {
        return current_user_can( 'manage_options' ) || is_user_logged_in();
    }

    public function get_jamaah_list( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        
        $where = "WHERE 1=1";
        $args = array();

        if ( $request->get_param( 'package_id' ) ) {
            $where .= " AND package_id = %d";
            $args[] = (int) $request->get_param( 'package_id' );
        }

        if ( $request->get_param( 'search' ) ) {
            $search = '%' . $wpdb->esc_like( $request->get_param( 'search' ) ) . '%';
            $where .= " AND (full_name LIKE %s OR passport_number LIKE %s)";
            $args[] = $search;
            $args[] = $search;
        }

        if ( $request->get_param( 'payment_status' ) ) {
            $status = $request->get_param( 'payment_status' );
            if ( $status === 'unpaid_partial' ) {
                $where .= " AND payment_status != 'paid'";
            } else {
                $where .= " AND payment_status = %s";
                $args[] = $status;
            }
        }

        $query = "SELECT * FROM $table $where ORDER BY created_at DESC";
        
        if ( ! empty( $args ) ) {
            $results = $wpdb->get_results( $wpdb->prepare( $query, $args ) );
        } else {
            $results = $wpdb->get_results( $query );
        }

        foreach ( $results as $row ) {
            $row->address_details = json_decode( $row->address_details );
            $row->document_status = json_decode( $row->document_status );
            $row->remaining_payment = (float)$row->package_price - (float)$row->total_paid;
            $row->package_name = $this->get_package_name( $row->package_id );
        }

        return rest_ensure_response( $results );
    }

    public function create_jamaah( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';

        $params = $request->get_json_params();
        if (!$params) $params = $request->get_params(); // Fallback

        $package_id = isset($params['package_id']) ? (int) $params['package_id'] : 0;
        $room_type  = isset($params['selected_room_type']) ? sanitize_text_field($params['selected_room_type']) : 'Quad';
        
        // Hitung harga otomatis
        $deal_price = $this->get_package_price($package_id, $room_type);

        $data = array(
            'package_id'         => $package_id,
            'selected_room_type' => $room_type,
            'package_price'      => $deal_price,
            'full_name'          => sanitize_text_field( $params['full_name'] ?? '' ),
            'gender'             => sanitize_text_field( $params['gender'] ?? 'L' ),
            'birth_date'         => sanitize_text_field( $params['birth_date'] ?? '' ),
            'passport_number'    => sanitize_text_field( $params['passport_number'] ?? '' ),
            'phone_number'       => sanitize_text_field( $params['phone_number'] ?? '' ),
            'files_ktp'          => esc_url_raw( $params['files_ktp'] ?? '' ),
            'files_kk'           => esc_url_raw( $params['files_kk'] ?? '' ),
            'files_passport'     => esc_url_raw( $params['files_passport'] ?? '' ),
            'kit_status'         => 'pending',
            'payment_status'     => 'unpaid',
            'total_paid'         => 0,
            'created_by'         => get_current_user_id(),
            'created_at'         => current_time('mysql')
        );

        // Fix: Encode array ke JSON string sebelum simpan
        $address = isset($params['address_details']) ? $params['address_details'] : [];
        $data['address_details'] = json_encode($address);

        $docs = isset($params['document_status']) ? $params['document_status'] : [];
        $data['document_status'] = json_encode($docs);

        if ( empty( $data['full_name'] ) ) {
            return new WP_Error( 'missing_name', 'Nama Lengkap wajib diisi', array( 'status' => 400 ) );
        }

        $inserted = $wpdb->insert( $table, $data );

        if ( $inserted ) {
            return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Jamaah berhasil disimpan' ) );
        }

        return new WP_Error( 'db_error', 'Gagal menyimpan: ' . $wpdb->last_error, array( 'status' => 500 ) );
    }

    public function update_jamaah( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $id = $request->get_param( 'id' );
        $params = $request->get_json_params();

        $data = array();
        $fields = ['full_name', 'gender', 'birth_date', 'passport_number', 'phone_number', 'kit_status', 'files_ktp', 'files_kk', 'files_passport'];

        foreach ($fields as $field) {
            if ( isset($params[$field]) ) {
                $data[$field] = sanitize_text_field($params[$field]);
            }
        }

        // Handle JSON updates
        if ( isset($params['address_details']) ) {
            $data['address_details'] = json_encode($params['address_details']);
        }
        if ( isset($params['document_status']) ) {
            $data['document_status'] = json_encode($params['document_status']);
        }

        $updated = $wpdb->update( $table, $data, array( 'id' => $id ) );

        if ( $updated !== false ) {
            return rest_ensure_response( array( 'message' => 'Data diperbarui' ) );
        }

        return new WP_Error( 'db_error', 'Gagal update database', array( 'status' => 500 ) );
    }

    public function delete_jamaah( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $wpdb->delete( $table, array( 'id' => $request['id'] ) );
        return rest_ensure_response( array( 'message' => 'Data dihapus' ) );
    }

    public function get_jamaah_detail( $request ) {
        global $wpdb;
        $id = (int) $request['id'];
        $row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}umh_jamaah WHERE id = %d", $id ) );

        if(!$row) return new WP_Error('not_found', 'Jamaah tidak ditemukan', ['status'=>404]);

        $row->address_details = json_decode($row->address_details);
        $row->document_status = json_decode($row->document_status);
        $row->package_name = $this->get_package_name($row->package_id);

        return rest_ensure_response($row);
    }

    private function get_package_price($package_id, $room_type) {
        global $wpdb;
        $pkg = $wpdb->get_row($wpdb->prepare("SELECT pricing_variants FROM {$wpdb->prefix}umh_packages WHERE id=%d", $package_id));
        if($pkg) {
            $variants = json_decode($pkg->pricing_variants, true);
            if(is_array($variants)) {
                foreach($variants as $v) {
                    if(strtolower($v['type']) == strtolower($room_type)) return (float)$v['price'];
                }
            }
        }
        return 0;
    }

    private function get_package_name( $id ) {
        global $wpdb;
        return $wpdb->get_var( $wpdb->prepare( "SELECT name FROM {$wpdb->prefix}umh_packages WHERE id = %d", $id ) );
    }
}
new UMH_API_Jamaah();