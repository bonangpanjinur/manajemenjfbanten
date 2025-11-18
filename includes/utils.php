<?php
// Lokasi: includes/utils.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Mendapatkan konteks pengguna saat ini untuk API.
 * Mengembalikan array dengan id, email, dan role.
 */
function umh_get_current_user_context() {
    $user = wp_get_current_user();
    if (0 === $user->ID) {
        // --- PERBAIKAN: Logika token kustom (jika diperlukan untuk klien eksternal) ---
        // Saat ini, aplikasi React berjalan di dalam admin,
        // jadi jika $user->ID adalah 0, berarti dia benar-benar 'guest'.
        // Logika token di bawah ini akan relevan jika ada aplikasi seluler/eksternal.
        global $wpdb;
        $token = null;

        if (!empty($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            $token = $matches[1];
        }

        if ($token) {
            $table_name = $wpdb->prefix . 'umh_users';
            $headless_user = $wpdb->get_row($wpdb->prepare(
                "SELECT id, email, full_name, role FROM $table_name WHERE auth_token = %s AND token_expires > %s",
                $token,
                current_time('mysql')
            ));

            if ($headless_user) {
                return array(
                    'id'        => $headless_user->id,
                    'email'     => $headless_user->email,
                    'full_name' => $headless_user->full_name,
                    'role'      => $headless_user->role,
                );
            }
        }
        
        // Jika tidak ada user WP dan tidak ada token valid, dia adalah guest.
        return array(
            'id'    => 0,
            'email' => 'guest',
            'full_name' => 'Guest',
            'role'  => 'guest',
        );
        // --- AKHIR PERBAIKAN ---
    }

    // Jika user WP login:
    $custom_roles = umh_get_staff_roles(); // Menggunakan helper function
    $user_roles = $user->roles;
    $role = 'subscriber'; // Default

    // Cek dulu apakah dia Super Admin
    if (in_array('administrator', $user_roles, true)) {
        $role = 'administrator';
    } else {
        // Jika bukan, cari role kustom
        foreach ($custom_roles as $custom_role) {
            if (in_array($custom_role, $user_roles, true)) {
                $role = $custom_role;
                break; // Ambil role kustom pertama yang ditemukan
            }
        }
    }

    return array(
        'id'        => $user->ID,
        'email'     => $user->user_email,
        'full_name' => $user->display_name,
        'role'      => $role,
    );
}

/**
 * Memeriksa izin API berdasarkan role.
 *
 * @param WP_REST_Request $request        Request object.
 * @param array           $required_roles Array of roles that are allowed.
 * @return bool|WP_Error True if allowed, WP_Error if denied.
 */
function umh_check_api_permission($request, $required_roles) {
    // --- PERBAIKAN: Panggil umh_get_current_user_context() ---
    $user_context = umh_get_current_user_context();
    // --- AKHIR PERBAIKAN ---
    $user_role = $user_context['role'];
    $user_id = $user_context['id'];

    // Jika id 0, berarti guest (tidak login WP dan tidak ada token valid)
    if (0 === $user_id) {
         return new WP_Error(
            'rest_forbidden_context',
            __('Anda harus login untuk mengakses data ini.', 'umroh-manager-hybrid'),
            array('status' => 401)
        );
    }

    // Administrator WordPress selalu memiliki akses
    if ('administrator' === $user_role) {
        return true;
    }
    
    // Owner kustom selalu memiliki akses
    if ('owner' === $user_role) {
        return true;
    }
    
    // --- PERBAIKAN: Izinkan jika array role yang dibutuhkan kosong (hanya cek login) ---
    if (empty($required_roles) && $user_id > 0) {
        return true; // Hanya butuh login, role apapun
    }
    // --- AKHIR PERBAIKAN ---

    if (in_array($user_role, $required_roles, true)) {
        return true;
    }

    // Jika tidak ada role yang cocok
    return new WP_Error(
        'rest_forbidden_context',
        __('Maaf, Anda tidak memiliki izin untuk melakukan tindakan ini.', 'umroh-manager-hybrid'),
        array('status' => 403)
    );
}


// <!-- PERBAIKAN (Kategori 3): Pindahkan fungsi log ke sini -->
/**
 * Membuat entri log baru di database.
 * Ini dipindahkan dari api-logs.php agar bisa diakses secara global,
 * terutama oleh UMH_CRUD_Controller.
 */
function umh_create_log_entry($user_id, $action_type, $related_table, $related_id, $description, $details_json = '') {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logs';

    // Pastikan user_id adalah integer yang valid
    $user_id_to_insert = intval($user_id);
    
    // Jika user_id 0 (mungkin sistem atau pengguna tidak dikenal), set ke NULL
    if ($user_id_to_insert === 0) {
        $user_id_to_insert = null;
    }

    $wpdb->insert(
        $table_name,
        array(
            'user_id' => $user_id_to_insert,
            'action_type' => $action_type,
            'related_table' => $related_table,
            'related_id' => $related_id,
            'description' => $description,
            'details_json' => $details_json,
            'timestamp' => current_time('mysql', 1) // Gunakan GMT
        ),
        array(
            '%d', // user_id (bisa null)
            '%s', // action_type
            '%s', // related_table
            '%d', // related_id
            '%s', // description
            '%s', // details_json
            '%s'  // timestamp
        )
    );
}
// <!-- AKHIR PERBAIKAN -->