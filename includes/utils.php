<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Membuat entri log aktivitas.
 */
function umh_create_log_entry($user_id, $action_type, $related_table, $related_id, $description, $details_json = '') {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logs';

    // Pastikan user_id valid, jika 0 berarti sistem/guest
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
            'timestamp' => current_time('mysql', 1) // GMT
        ],
        ['%d', '%s', '%s', '%d', '%s', '%s', '%s']
    );
}

/**
 * Memeriksa izin API berdasarkan role staff.
 * * @param WP_REST_Request $request
 * @param array $required_capabilities Array kemampuan yang dibutuhkan (salah satu harus dimiliki).
 */
function umh_check_api_permission($request, $required_capabilities = []) {
    // 1. Dapatkan konteks user saat ini
    $context = umh_get_current_user_context();
    
    // 2. Jika tidak login, tolak
    if ($context['id'] === 0) {
        return new WP_Error('rest_forbidden', 'Anda harus login.', ['status' => 401]);
    }
    
    // 3. Jika user adalah administrator WP, izinkan semua
    if ($context['role'] === 'administrator') {
        return true;
    }
    
    // 4. Jika tidak ada kapabilitas spesifik yang diminta, cukup login saja
    if (empty($required_capabilities)) {
        return true;
    }

    // 5. Cek apakah role user ada di daftar yang diizinkan
    // Logika: Role di tabel umh_hr harus cocok dengan salah satu di $required_capabilities
    // Catatan: $required_capabilities di sini berisi daftar role key (misal: 'marketing_staff')
    if (in_array($context['role'], $required_capabilities)) {
        return true;
    }

    return new WP_Error('rest_forbidden', 'Anda tidak memiliki izin untuk akses ini.', ['status' => 403]);
}

/**
 * Mengambil data role staff dari database.
 */
function umh_get_staff_role_data($user_id) {
    global $wpdb;
    $hr_table = $wpdb->prefix . 'umh_hr';
    $roles_table = $wpdb->prefix . 'umh_roles';

    // Cek administrator WP native
    $user = get_userdata($user_id);
    if ($user && in_array('administrator', $user->roles)) {
        return ['name' => 'administrator', 'permissions' => ['all']];
    }

    // Cek di tabel HR
    $hr_entry = $wpdb->get_row($wpdb->prepare("SELECT role_id FROM $hr_table WHERE wp_user_id = %d AND status = 'active'", $user_id));

    if (!$hr_entry) {
        return ['name' => 'subscriber', 'permissions' => []];
    }

    // Cek detail Role
    $role_entry = $wpdb->get_row($wpdb->prepare("SELECT name, permissions_json FROM $roles_table WHERE id = %d", $hr_entry->role_id));

    if (!$role_entry) {
        return ['name' => 'staff', 'permissions' => []];
    }
    
    // Mapping nama role DB ke slug sistem yang konsisten
    // Misal: "Marketing Staff" -> "marketing_staff"
    $role_slug = strtolower(str_replace(' ', '_', $role_entry->name));

    return [
        'name' => $role_slug,
        'permissions' => !empty($role_entry->permissions_json) ? json_decode($role_entry->permissions_json, true) : []
    ];
}

/**
 * Mendapatkan data user untuk React context.
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

// Helper Formatter
function umh_format_currency($amount) {
    return 'Rp ' . number_format((float)$amount, 0, ',', '.');
}