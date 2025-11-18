<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Log aktivitas pengguna ke database.
 *
 * @param int $user_id ID pengguna WordPress.
 * @param string $action_type Tipe aksi (misal: 'create_jamaah', 'update_package').
 * @param string $description Deskripsi singkat.
 * @param string $related_table (Opsional) Tabel terkait.
 * @param int $related_id (Opsional) ID entitas terkait.
 * @param array $details (Opsional) Data tambahan (seperti data lama vs baru) dalam bentuk array.
 */
function umh_log_activity($user_id, $action_type, $description, $related_table = null, $related_id = null, $details = null) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logs';

    $wpdb->insert(
        $table_name,
        [
            'user_id' => $user_id,
            'action_type' => $action_type,
            'related_table' => $related_table,
            'related_id' => $related_id,
            'description' => $description,
            'details_json' => $details ? wp_json_encode($details) : null,
            'timestamp' => current_time('mysql', 1)
        ],
        [
            '%d', // user_id
            '%s', // action_type
            '%s', // related_table
            '%d', // related_id
            '%s', // description
            '%s', // details_json
            '%s'  // timestamp
        ]
    );
}

/**
 * Memeriksa izin pengguna untuk REST API.
 * Saat ini hanya memeriksa apakah pengguna login.
 * TODO: Implementasi pemeriksaan kapabilitas yang lebih detail.
 */
function umh_check_permission() {
    return is_user_logged_in();
}


// --- PENAMBAHAN: Fungsi helper baru untuk mengambil data role ---
/**
 * Mengambil data role dan permissions staff dari database.
 *
 * @param int $user_id ID user WordPress.
 * @return array Data role ['name' => (string), 'permissions' => (array)]
 */
function umh_get_staff_role_data($user_id) {
    global $wpdb;
    $hr_table = $wpdb->prefix . 'umh_hr';
    $roles_table = $wpdb->prefix . 'umh_roles';

    // 1. Dapatkan role_id dari tabel HR
    $hr_entry = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT role_id FROM $hr_table WHERE wp_user_id = %d",
            $user_id
        )
    );

    if (!$hr_entry || !$hr_entry->role_id) {
        // User ini mungkin admin WordPress tapi bukan staff HR
        $user = get_userdata($user_id);
        if ($user && in_array('administrator', $user->roles)) {
            return ['name' => 'administrator', 'permissions' => ['administrator']]; // Full admin
        }
        return ['name' => 'none', 'permissions' => []]; // Bukan staff & bukan admin
    }

    $role_id = $hr_entry->role_id;

    // 2. Dapatkan nama role dan permissions_json dari tabel Roles
    $role_entry = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT name, permissions_json FROM $roles_table WHERE id = %d",
            $role_id
        )
    );

    if (!$role_entry) {
        return ['name' => 'none', 'permissions' => []]; // Role tidak ditemukan
    }

    // 3. Decode JSON
    $permissions = [];
    if (!empty($role_entry->permissions_json)) {
        $permissions = json_decode($role_entry->permissions_json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $permissions = []; // JSON tidak valid
        }
    }

    return [
        'name' => $role_entry->name,
        'permissions' => $permissions
    ];
}
// --- AKHIR PENAMBAHAN ---


/**
 * Mendapatkan data user yang login untuk React context.
 */
function umh_get_current_user_context() {
    if (!is_user_logged_in()) {
        return [ 'id' => 0, 'name' => 'Guest', 'role' => 'none', 'permissions' => [] ];
    }

    $user = wp_get_current_user();
    
    // --- PERBAIKAN: Mengganti logika role & permission ---
    // $role = 'administrator'; // Hapus default yang salah

    // Panggil fungsi helper baru
    $role_data = umh_get_staff_role_data($user->ID);
    
    $role = $role_data['name'];
    $permissions = $role_data['permissions'];
    // --- AKHIR PERBAIKAN ---

    return [
        'id' => $user->ID,
        'name' => $user->display_name,
        'email' => $user->user_email,
        'role' => $role, // 'administrator', 'finance', 'marketing', etc.
        'permissions' => $permissions // Array of capabilities
    ];
}

/**
 * Utility function to send JSON response.
 */
function umh_send_json_success($data = null) {
    wp_send_json_success($data, 200);
}

/**
 * Utility function to send JSON error response.
 */
function umh_send_json_error($message, $status_code = 400, $error_code = 'umh_error') {
    wp_send_json_error(
        [
            'code' => $error_code,
            'message' => $message
        ],
        $status_code
    );
}

/**
 * Memformat tanggal untuk database, menangani string kosong atau null.
 */
function umh_format_date_for_db($date_string) {
    if (empty($date_string) || $date_string === '0000-00-00') {
        return null;
    }
    try {
        $date = new DateTime($date_string);
        return $date->format('Y-m-d');
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Membersihkan input data.
 */
function umh_sanitize_input($data) {
    if (is_array($data)) {
        return array_map('umh_sanitize_input', $data);
    } else {
        return sanitize_text_field($data);
    }
}