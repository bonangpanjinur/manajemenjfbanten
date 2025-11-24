<?php
defined('ABSPATH') || exit;

/**
 * ============================================================================
 * 1. UPDATE SCHEMA DATABASE OTOMATIS
 * ============================================================================
 * Menambahkan kolom: images, facilities, hotels, airline, itinerary
 * Berjalan otomatis saat plugin dimuat.
 */
function umh_update_package_schema_complete() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_packages';
    
    // Pastikan tabel ada dulu (dibuat oleh db-schema.php utama)
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        return; 
    }

    // Daftar kolom yang wajib ada untuk fitur lengkap
    $columns = [
        'images'     => 'LONGTEXT NULL',      // Menyimpan Array URL Gambar (JSON)
        'facilities' => 'TEXT NULL',          // Menyimpan Array Fasilitas (JSON)
        'hotels'     => 'TEXT NULL',          // Menyimpan Object Hotel (JSON)
        'airline'    => 'VARCHAR(255) NULL',  // Nama Maskapai
        'itinerary'  => 'LONGTEXT NULL'       // Menyimpan Data Itinerary Builder (JSON)
    ];

    foreach ($columns as $col => $type) {
        $check = $wpdb->get_results("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '$table_name' AND column_name = '$col'");
        if (empty($check)) {
            $wpdb->query("ALTER TABLE $table_name ADD COLUMN $col $type");
        }
    }
}
add_action('plugins_loaded', 'umh_update_package_schema_complete');

/**
 * ============================================================================
 * 2. REGISTER ROUTES API
 * ============================================================================
 */
add_action('rest_api_init', function () {
    
    // --- A. ENDPOINT UTAMA PAKET ---
    register_rest_route('umh/v1', '/packages', [
        [
            'methods'  => 'GET',
            'callback' => 'umh_get_packages',
            'permission_callback' => function() { return is_user_logged_in(); }
        ],
        [
            'methods'  => 'POST', // Create Baru
            'callback' => 'umh_create_package',
            'permission_callback' => function() { return current_user_can('manage_options'); }
        ]
    ]);

    // --- B. ENDPOINT DETAIL PAKET (GET, UPDATE, DELETE) ---
    register_rest_route('umh/v1', '/packages/(?P<id>\d+)', [
        [
            'methods'  => 'GET',
            'callback' => 'umh_get_single_package',
            'permission_callback' => function() { return is_user_logged_in(); }
        ],
        [
            // Mendukung POST dan PUT untuk update agar fleksibel
            'methods'  => ['POST', 'PUT', 'PATCH'], 
            'callback' => 'umh_update_package',
            'permission_callback' => function() { return current_user_can('manage_options'); }
        ],
        [
            'methods'  => 'DELETE',
            'callback' => 'umh_delete_package',
            'permission_callback' => function() { return current_user_can('manage_options'); }
        ]
    ]);
    
    // --- C. ENDPOINT UPLOAD GAMBAR ---
    register_rest_route('umh/v1', '/upload', [
        'methods'  => 'POST',
        'callback' => 'umh_handle_file_upload',
        'permission_callback' => function () { return current_user_can('upload_files'); }
    ]);
});

/**
 * ============================================================================
 * 3. CONTROLLER FUNCTIONS (LOGIKA CRUD)
 * ============================================================================
 */

// --- GET ALL PACKAGES ---
function umh_get_packages() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_packages';
    
    // Ambil data urut dari yang terbaru
    $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");
    
    // Decode JSON string kembali ke Array/Object agar bisa dibaca React
    foreach ($results as $key => $row) {
        $results[$key]->images     = json_decode($row->images) ?: [];
        $results[$key]->facilities = json_decode($row->facilities) ?: [];
        $results[$key]->hotels     = json_decode($row->hotels) ?: (object)[];
        $results[$key]->itinerary  = json_decode($row->itinerary) ?: [];
    }
    
    return rest_ensure_response(['success' => true, 'data' => $results]);
}

// --- GET SINGLE PACKAGE ---
function umh_get_single_package($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_packages';
    $id = $request['id'];
    
    $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id));
    
    if (!$row) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

    // Decode JSON
    $row->images     = json_decode($row->images) ?: [];
    $row->facilities = json_decode($row->facilities) ?: [];
    $row->hotels     = json_decode($row->hotels) ?: (object)['makkah'=>'', 'madinah'=>''];
    $row->itinerary  = json_decode($row->itinerary) ?: [];
    
    return rest_ensure_response(['success' => true, 'data' => $row]);
}

// --- CREATE PACKAGE ---
function umh_create_package($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_packages';
    $params = $request->get_json_params();

    if (empty($params['name'])) {
        return new WP_Error('validation_error', 'Nama paket wajib diisi', ['status' => 400]);
    }

    // Sanitasi dan persiapan data
    $data = [
        'name'        => sanitize_text_field($params['name']),
        'price'       => floatval($params['price']),
        'duration'    => intval($params['duration']),
        'description' => wp_kses_post($params['description']), // Mengizinkan HTML dasar
        'airline'     => sanitize_text_field($params['airline'] ?? ''),
        
        // Simpan data kompleks sebagai JSON String
        'images'      => isset($params['images']) ? json_encode($params['images']) : '[]',
        'facilities'  => isset($params['facilities']) ? json_encode($params['facilities']) : '[]',
        'hotels'      => isset($params['hotel_makkah']) ? json_encode([
            'makkah'  => sanitize_text_field($params['hotel_makkah']), 
            'madinah' => sanitize_text_field($params['hotel_madinah'])
        ]) : '{}',
        'created_at'  => current_time('mysql')
    ];

    // Format %s = string, %d = int, %f = float
    $format = ['%s', '%f', '%d', '%s', '%s', '%s', '%s', '%s', '%s'];

    $wpdb->insert($table_name, $data, $format);
    
    if ($wpdb->last_error) {
        return new WP_Error('db_error', $wpdb->last_error, ['status' => 500]);
    }

    return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id, 'message' => 'Paket berhasil dibuat']);
}

// --- UPDATE PACKAGE (Mendukung Partial Update & Itinerary) ---
function umh_update_package($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_packages';
    $id = $request['id'];
    $params = $request->get_json_params();

    if (!$params) {
        return new WP_Error('invalid_data', 'Data tidak valid', ['status' => 400]);
    }

    $data = [];
    $format = [];

    // Update Field Standar (Hanya jika dikirim)
    if (isset($params['name'])) {
        $data['name'] = sanitize_text_field($params['name']);
        $format[] = '%s';
    }
    if (isset($params['price'])) {
        $data['price'] = floatval($params['price']);
        $format[] = '%f';
    }
    if (isset($params['duration'])) {
        $data['duration'] = intval($params['duration']);
        $format[] = '%d';
    }
    if (isset($params['description'])) {
        $data['description'] = wp_kses_post($params['description']);
        $format[] = '%s';
    }
    if (isset($params['airline'])) {
        $data['airline'] = sanitize_text_field($params['airline']);
        $format[] = '%s';
    }
    if (isset($params['images'])) {
        $data['images'] = json_encode($params['images']);
        $format[] = '%s';
    }
    if (isset($params['facilities'])) {
        $data['facilities'] = json_encode($params['facilities']);
        $format[] = '%s';
    }
    
    // Update Hotel (Object JSON)
    if (isset($params['hotel_makkah']) || isset($params['hotel_madinah'])) {
        // Ambil data lama dulu agar tidak tertimpa kosong
        $current_json = $wpdb->get_var($wpdb->prepare("SELECT hotels FROM $table_name WHERE id = %d", $id));
        $hotels_obj = json_decode($current_json, true) ?: [];
        
        if (isset($params['hotel_makkah'])) $hotels_obj['makkah'] = sanitize_text_field($params['hotel_makkah']);
        if (isset($params['hotel_madinah'])) $hotels_obj['madinah'] = sanitize_text_field($params['hotel_madinah']);
        
        $data['hotels'] = json_encode($hotels_obj);
        $format[] = '%s';
    }

    // --- FITUR ITINERARY BUILDER ---
    // Jika ada data 'itinerary_data', kita simpan ke kolom 'itinerary'
    if (isset($params['itinerary_data'])) {
        $data['itinerary'] = json_encode($params['itinerary_data']);
        $format[] = '%s';
    }

    if (empty($data)) {
        return rest_ensure_response(['success' => true, 'message' => 'Tidak ada data yang berubah']);
    }

    $data['updated_at'] = current_time('mysql');
    $format[] = '%s';

    $wpdb->update($table_name, $data, ['id' => $id], $format, ['%d']);
    
    return rest_ensure_response(['success' => true, 'message' => 'Paket berhasil diperbarui']);
}

// --- DELETE PACKAGE ---
function umh_delete_package($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_packages';
    $id = $request['id'];
    
    $deleted = $wpdb->delete($table_name, ['id' => $id], ['%d']);
    
    if ($deleted) {
        return rest_ensure_response(['success' => true, 'message' => 'Paket dihapus']);
    } else {
        return new WP_Error('db_error', 'Gagal menghapus paket (Mungkin ID salah)', ['status' => 500]);
    }
}

// --- HANDLE FILE UPLOAD (WordPress Media Library) ---
function umh_handle_file_upload($request) {
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/media.php');

    $files = $request->get_file_params();
    
    if (empty($files['file'])) {
        return new WP_Error('no_file', 'Tidak ada file yang diunggah', ['status' => 400]);
    }

    // Fungsi 'media_handle_upload' otomatis menyimpan ke wp-content/uploads 
    // dan membuat record di database WordPress Media
    $attachment_id = media_handle_upload('file', 0);

    if (is_wp_error($attachment_id)) {
        return $attachment_id;
    }

    $url = wp_get_attachment_url($attachment_id);

    return rest_ensure_response([
        'success' => true,
        'url' => $url,
        'id' => $attachment_id
    ]);
}