<?php
// File: includes/api/api-jamaah.php
// Mengelola semua data jemaah, manifest, dan pembayaran terkait.
// (DIMODIFIKASI untuk skema tabel jemaah yang baru)

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_action('rest_api_init', 'umh_register_jamaah_routes');

function umh_register_jamaah_routes() {
    $namespace = 'umh/v1'; // Namespace baru yang konsisten

    // Tentukan role yang diizinkan
    $read_permissions = ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'];
    $write_permissions = ['owner', 'admin_staff'];
    $delete_permissions = ['owner'];
    // $payment_permissions = ['owner', 'admin_staff', 'finance_staff']; // Dipindahkan ke api-jamaah-payments.php

    // Endpoint untuk CRUD Jamaah
    register_rest_route($namespace, '/jamaah', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_all_jamaah',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($read_permissions) {
                return umh_check_api_permission($request, $read_permissions);
            },
            // --- AKHIR PERBAIKAN ---
        ],
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'umh_create_jamaah',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($write_permissions) {
                return umh_check_api_permission($request, $write_permissions);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => umh_get_jamaah_schema(),
        ],
    ]);

    // Endpoint untuk satu Jamaah (by ID)
    register_rest_route($namespace, '/jamaah/(?P<id>\d+)', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_jamaah_by_id',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($read_permissions) {
                return umh_check_api_permission($request, $read_permissions);
            },
            // --- AKHIR PERBAIKAN ---
        ],
        [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => 'umh_update_jamaah',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($write_permissions) {
                return umh_check_api_permission($request, $write_permissions);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => umh_get_jamaah_schema(true), // true for update
        ],
        [
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => 'umh_delete_jamaah',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($delete_permissions) {
                return umh_check_api_permission($request, $delete_permissions);
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);
    
    // Endpoint untuk pembayaran (Dipindahkan ke api-jamaah-payments.php)
    // ...
}

// Skema data Jamaah untuk validasi (VERSI 1.3)
function umh_get_jamaah_schema($is_update = false) {
    $schema = [
        'package_id' => ['type' => 'integer', 'required' => !$is_update],
        'user_id' => ['type' => 'integer', 'required' => false],
        'full_name' => ['type' => 'string', 'required' => !$is_update],
        'id_number' => ['type' => 'string', 'required' => !$is_update],
        'passport_number' => ['type' => 'string', 'required' => false],
        'phone' => ['type' => 'string', 'required' => false],
        'email' => ['type' => 'string', 'format' => 'email', 'required' => false],
        'address' => ['type' => 'string', 'required' => false],
        'gender' => ['type' => 'string', 'enum' => ['male', 'female'], 'required' => false],
        'birth_date' => ['type' => 'string', 'format' => 'date', 'required' => false],
        'status' => ['type' => 'string', 'enum' => ['pending', 'approved', 'rejected', 'waitlist'], 'default' => 'pending'],
        
        // Info Pembayaran
        'payment_status' => ['type' => 'string', 'enum' => ['pending', 'dp', 'cicil', 'lunas', 'refunded'], 'default' => 'pending'],
        'total_price' => ['type' => 'number', 'required' => false],
        'amount_paid' => ['type' => 'number', 'default' => 0], // Ini akan di-update oleh helper
        
        // Dokumen (Upload)
        'passport_scan' => ['type' => 'string', 'required' => false],
        'ktp_scan' => ['type' => 'string', 'required' => false],
        'kk_scan' => ['type' => 'string', 'required' => false],
        'meningitis_scan' => ['type' => 'string', 'required' => false],
        'profile_photo' => ['type' => 'string', 'required' => false],
        
        // Dokumen (Checklist Verifikasi Admin)
        'is_passport_verified' => ['type' => 'boolean', 'required' => false],
        'is_ktp_verified' => ['type' => 'boolean', 'required' => false],
        'is_kk_verified' => ['type' => 'boolean', 'required' => false],
        'is_meningitis_verified' => ['type' => 'boolean', 'required' => false],
        
        // Perlengkapan
        'equipment_status' => ['type' => 'string', 'enum' => ['belum_di_kirim', 'di_kirim', 'diterima'], 'default' => 'belum_di_kirim'],
        
        'notes' => ['type' => 'string', 'required' => false],
    ];

    if ($is_update) {
        foreach ($schema as $key => &$field) {
            $field['required'] = false;
            // Hapus 'amount_paid' dari update manual, karena dihitung otomatis
            if ($key === 'amount_paid') {
                 unset($schema[$key]);
            }
        }
    }

    return $schema;
}


// Callback: Get All Jamaah
function umh_get_all_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $package_table = $wpdb->prefix . 'umh_packages';

    $package_id = $request->get_param('package_id');
    $status = $request->get_param('status');
    $payment_status = $request->get_param('payment_status');

    // --- PERBAIKAN: Menggunakan 'name' dari tabel paket baru ---
    $query = "SELECT j.*, p.name as package_name FROM $table_name j LEFT JOIN $package_table p ON j.package_id = p.id WHERE 1=1";
    // --- AKHIR PERBAIKAN ---

    if (!empty($package_id)) {
        $query .= $wpdb->prepare(" AND j.package_id = %d", $package_id);
    }
    if (!empty($status)) {
        $query .= $wpdb->prepare(" AND j.status = %s", $status);
    }
    if (!empty($payment_status)) {
        $query .= $wpdb->prepare(" AND j.payment_status = %s", $payment_status);
    }

    $results = $wpdb->get_results($query, ARRAY_A);
    
    if ($results === false) {
        return new WP_Error('db_error', __('Database error.', 'umh'), ['status' => 500]);
    }

    return new WP_REST_Response($results, 200);
}

// Callback: Create Jamaah
function umh_create_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';

    $data = $request->get_json_params();
    
    // Ambil harga paket jika total_price tidak diset
    if (!isset($data['total_price']) && isset($data['package_id'])) {
        $package_table = $wpdb->prefix . 'umh_packages';
        // Ambil harga dari price_details JSON, misal 'quad'
        $price_details_json = $wpdb->get_var($wpdb->prepare("SELECT price_details FROM $package_table WHERE id = %d", $data['package_id']));
        $price_details = json_decode($price_details_json, true);
        
        // --- PERBAIKAN: Asumsi default ambil harga 'quad' atau 'price' ---
        $default_price = 0;
        if(is_array($price_details) && !empty($price_details)) {
             // Coba cari 'quad' atau ambil nilai pertama
            $default_price = $price_details['quad'] ?? $price_details[0]['price'] ?? 0;
        }
        $data['total_price'] = $default_price; 
        // --- AKHIR PERBAIKAN ---
    }
    
    $data['amount_paid'] = 0; // Selalu 0 saat baru dibuat
    $data['status'] = $data['status'] ?? 'pending';
    $data['payment_status'] = $data['payment_status'] ?? 'pending';
    $data['equipment_status'] = $data['equipment_status'] ?? 'belum_di_kirim';
    $data['created_at'] = current_time('mysql');

    // Filter data sesuai skema
    $schema = umh_get_jamaah_schema();
    $insert_data = [];
    foreach ($schema as $key => $value) {
        if (isset($data[$key])) {
            $insert_data[$key] = $data[$key];
        }
    }
    
    $insert_data['created_at'] = current_time('mysql');
    $insert_data['updated_at'] = current_time('mysql');
    
    // Pastikan boolean disimpan sebagai 0 atau 1
    $bool_fields = ['is_passport_verified', 'is_ktp_verified', 'is_kk_verified', 'is_meningitis_verified'];
    foreach ($bool_fields as $field) {
        if (isset($insert_data[$field])) {
            $insert_data[$field] = $insert_data[$field] ? 1 : 0;
        }
    }


    $result = $wpdb->insert($table_name, $insert_data);

    if ($result === false) {
        return new WP_Error('db_error', __('Failed to create jamaah.', 'umh'), ['status' => 500, 'db_error' => $wpdb->last_error]);
    }

    $new_id = $wpdb->insert_id;
    // umh_create_log_entry('create', 'jamaah', $new_id, $data); 

    return new WP_REST_Response(['id' => $new_id, 'message' => 'Jamaah created successfully.'], 201);
}

// Callback: Get Jamaah by ID
function umh_get_jamaah_by_id(WP_REST_Request $request) {
    global $wpdb;
    $id = (int)$request['id'];
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $package_table = $wpdb->prefix . 'umh_packages';
    
    // --- PERBAIKAN: Menggunakan 'name' dari tabel paket baru ---
    $query = $wpdb->prepare("SELECT j.*, p.name as package_name FROM $table_name j LEFT JOIN $package_table p ON j.package_id = p.id WHERE j.id = %d", $id);
    // --- AKHIR PERBAIKAN ---
    $jamaah = $wpdb->get_row($query, ARRAY_A);

    if (!$jamaah) {
        return new WP_Error('not_found', __('Jamaah not found.', 'umh'), ['status' => 404]);
    }

    return new WP_REST_Response($jamaah, 200);
}

// Callback: Update Jamaah
function umh_update_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $id = (int)$request['id'];
    $table_name = $wpdb->prefix . 'umh_jamaah';

    $data = $request->get_json_params();
    
    // Filter data sesuai skema
    $schema = umh_get_jamaah_schema(true); // true = update (tidak wajib)
    $update_data = [];
     foreach ($schema as $key => $value) {
        if (isset($data[$key])) {
            $update_data[$key] = $data[$key];
        }
    }
    
    $update_data['updated_at'] = current_time('mysql');

    if (empty($update_data)) {
         return new WP_Error('bad_request', __('No data provided for update.', 'umh'), ['status' => 400]);
    }
    
    // Pastikan boolean disimpan sebagai 0 atau 1
    $bool_fields = ['is_passport_verified', 'is_ktp_verified', 'is_kk_verified', 'is_meningitis_verified'];
    foreach ($bool_fields as $field) {
        if (isset($update_data[$field])) {
            $update_data[$field] = $update_data[$field] ? 1 : 0;
        }
    }

    $result = $wpdb->update($table_name, $update_data, ['id' => $id]);

    if ($result === false) {
        return new WP_Error('db_error', __('Failed to update jamaah.', 'umh'), ['status' => 500, 'db_error' => $wpdb->last_error]);
    }
    
    // umh_create_log_entry('update', 'jamaah', $id, $data);

    return new WP_REST_Response(['id' => $id, 'message' => 'Jamaah updated successfully.'], 200);
}

// Callback: Delete Jamaah
function umh_delete_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $id = (int)$request['id'];
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $payments_table = $wpdb->prefix . 'umh_jamaah_payments';

    // Hapus juga riwayat pembayaran terkait
    $wpdb->delete($payments_table, ['jamaah_id' => $id], ['%d']);
    
    // Hapus jemaah
    $result = $wpdb->delete($table_name, ['id' => $id], ['%d']);

    if ($result === false) {
        return new WP_Error('db_error', __('Failed to delete jamaah.', 'umh'), ['status' => 500]);
    }
    
    if ($result === 0) {
        return new WP_Error('not_found', __('Jamaah not found to delete.', 'umh'), ['status' => 404]);
    }

    // umh_create_log_entry('delete', 'jamaah', $id);

    return new WP_REST_Response(['id' => $id, 'message' => 'Jamaah deleted successfully.'], 200);
}