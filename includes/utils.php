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
        return array(
            'id'    => 0,
            'email' => 'guest',
            'role'  => 'guest',
        );
    }

    // Ambil role kustom plugin
    $custom_roles = ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'];
    $user_roles = $user->roles;
    $role = 'subscriber'; // Default

    // Cari role paling relevan
    foreach ($custom_roles as $custom_role) {
        if (in_array($custom_role, $user_roles, true)) {
            $role = $custom_role;
            break; // Ambil role kustom pertama yang ditemukan
        }
    }
    
    // Jika tidak ada role kustom, cek role WP standar
    if ($role === 'subscriber') {
        if (in_array('administrator', $user_roles, true)) {
            $role = 'administrator';
        } elseif (in_array('editor', $user_roles, true)) {
            $role = 'editor';
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
    $user_context = umh_get_current_user_context();
    $user_role = $user_context['role'];

    // Administrator WordPress selalu memiliki akses
    if ('administrator' === $user_role) {
        return true;
    }
    
    // Owner kustom selalu memiliki akses
    if ('owner' === $user_role) {
        return true;
    }

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


// <!-- PERBAIKAN (Kategori 1, Poin 4): Pindahkan fungsi log ke sini -->
/**
 * Membuat entri log baru di database.
 * Ini dipindahkan dari api-logs.php agar bisa diakses secara global,
 * terutama oleh UMH_CRUD_Controller.
 */
function umh_create_log_entry($user_id, $action_type, $related_table, $related_id, $description, $details_json = '') {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logs';

    // Pastikan user_id adalah integer yang valid
    $user_id = intval($user_id);
    
    // Jika user_id 0 (mungkin sistem atau pengguna tidak dikenal), set ke NULL
    // Periksa apakah user_id ada di tabel wp_users
    $user_exists = $wpdb->get_var($wpdb->prepare("SELECT EXISTS(SELECT 1 FROM {$wpdb->users} WHERE ID = %d)", $user_id));

    if (!$user_exists || $user_id === 0) {
        $user_id_to_insert = null;
    } else {
        $user_id_to_insert = $user_id;
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
            'timestamp' => current_time('mysql', 1)
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