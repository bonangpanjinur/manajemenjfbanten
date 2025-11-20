<?php
/**
 * Bertanggung jawab untuk me-render root div untuk aplikasi React
 * dan meloloskan data dari PHP ke JavaScript.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Render div#root tempat aplikasi React akan di-mount.
 */
function umh_render_react_dashboard() {
    // ID ini harus sama persis dengan yang ada di src/index.jsx
    echo '<div id="umh-admin-app"></div>';
}

/**
 * Meloloskan data dari PHP (WordPress) ke JavaScript (React)
 * menggunakan wp_localize_script.
 *
 * Fungsi ini dipanggil dari umroh-manager-hybrid.php
 */
function umh_localize_script() {
    
    $user_data = [
        'id' => 0,
        'name' => 'Guest',
        'role' => 'none',
        'error' => '',
    ];

    // Pastikan fungsi helper tersedia (dari includes/utils.php)
    if (function_exists('umh_get_current_user_context')) {
        $user_data = umh_get_current_user_context();
    } else {
        $user_data['error'] = 'utils.php tidak termuat';
    }

    // Cek apakah user adalah admin WP (untuk hak akses khusus di UI)
    $is_wp_admin = (isset($user_data['role']) && $user_data['role'] === 'administrator');

    // --- PENTING: Nama objek harus 'umh_wp_data' sesuai dengan src/context/ApiContext.jsx ---
    wp_localize_script('umh-react-app', 'umh_wp_data', [
        'api_url'  => esc_url_raw(rest_url('umh/v1/')),
        'nonce'    => wp_create_nonce('wp_rest'),
        'user'     => $user_data, // Data user yang login
        'printUrl' => esc_url_raw(admin_url('admin.php?page=umh-print-registration')),
        'adminUrl' => esc_url_raw(admin_url()),
        'is_wp_admin' => $is_wp_admin,
    ]);
}