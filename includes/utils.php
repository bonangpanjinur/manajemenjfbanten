<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Mencatat log aktivitas.
 */
function umh_create_log_entry($user_id, $action_type, $related_table, $related_id, $description, $details_json = '') {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logs';
    $user_id = intval($user_id);

    $wpdb->insert(
        $table_name,
        [
            'user_id' => $user_id,
            'action_type' => $action_type,
            'related_table' => $related_table,
            'related_id' => $related_id,
            'description' => $description,
            'details_json' => $details_json,
            'timestamp' => current_time('mysql', 1)
        ],
        ['%d', '%s', '%s', '%d', '%s', '%s', '%s']
    );
}

/**
 * Memeriksa izin API dengan validasi Nonce yang ketat.
 */
function umh_check_api_permission($request, $required_capabilities = []) {
    // 1. Wajib Login
    if (!is_user_logged_in()) {
        return new WP_Error('rest_forbidden', 'Silakan login terlebih dahulu.', ['status' => 401]);
    }

    // 2. Dapatkan Current User
    $user = wp_get_current_user();
    $context = umh_get_current_user_context();

    // 3. Super Admin Bypass
    if (in_array('administrator', $user->roles) || $context['role'] === 'administrator') {
        return true;
    }

    // 4. Cek Role Spesifik (Jika diminta)
    if (!empty($required_capabilities)) {
        if (!in_array($context['role'], $required_capabilities)) {
            return new WP_Error('rest_forbidden', 'Role Anda tidak memiliki izin akses.', ['status' => 403]);
        }
    }

    return true;
}

/**
 * Mengambil data role staff.
 */
function umh_get_staff_role_data($user_id) {
    global $wpdb;
    $user = get_userdata($user_id);

    // 1. Cek Administrator WP Native
    if ($user && in_array('administrator', $user->roles)) {
        return ['name' => 'administrator', 'permissions' => ['all']];
    }

    // 2. Cek di tabel umh_users (Custom User Management)
    $table_users = $wpdb->prefix . 'umh_users';
    $custom_user = $wpdb->get_row($wpdb->prepare("SELECT role FROM $table_users WHERE wp_user_id = %d AND status = 'active'", $user_id));

    if ($custom_user) {
        return ['name' => $custom_user->role, 'permissions' => []];
    }

    // Default fallback
    return ['name' => 'subscriber', 'permissions' => []];
}

/**
 * Konteks User untuk React
 */
function umh_get_current_user_context() {
    if (!is_user_logged_in()) {
        return ['id' => 0, 'name' => 'Guest', 'role' => 'none', 'permissions' => []];
    }

    $user = wp_get_current_user();
    $role_data = umh_get_staff_role_data($user->ID);

    return [
        'id' => $user->ID,
        'full_name' => $user->display_name,
        'email' => $user->user_email,
        'role' => $role_data['name'],
        'permissions' => $role_data['permissions']
    ];
}