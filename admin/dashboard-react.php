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
    
    // Pastikan fungsi helper tersedia (dari includes/utils.php)
    if (!function_exists('umh_get_current_user_context')) { 
         wp_localize_script('umh-react-app', 'umh_wp_data', [
            'api_url' => esc_url_raw(rest_url('umh/v1/')),
            'nonce'   => wp_create_nonce('wp_rest'),
            'user'    => [
                'id' => 0,
                'name' => 'Error User',
                'role' => 'none',
                'error' => 'Gagal memuat data user (utils.php tidak termuat).',
            ],
            'printUrl' => esc_url_raw(admin_url('admin.php?page=umh-print-registration')),
            // --- PENAMBAHAN: Tambahkan data yang hilang ---
            'adminUrl' => esc_url_raw(admin_url()),
            'is_wp_admin' => false,
            // --- AKHIR PENAMBAHAN ---
        ]);
        return;
    }

    // Ambil data user yang sedang login
    $user_data = umh_get_current_user_context(); 

    // --- PENAMBAHAN: Cek apakah user adalah admin WP ---
    $is_wp_admin = ($user_data['role'] === 'administrator');
    // --- AKHIR PENAMBAHAN ---

    // Kirim data ke script 'umh-react-app' (handle dari wp_enqueue_script)
    // Data ini akan tersedia di JavaScript sebagai object window.umh_wp_data
    wp_localize_script('umh-react-app', 'umh_wp_data', [
        'api_url'  => esc_url_raw(rest_url('umh/v1/')),
        'nonce'    => wp_create_nonce('wp_rest'),
        'user'     => $user_data, // Data user yang login (id, name, role)
        'printUrl' => esc_url_raw(admin_url('admin.php?page=umh-print-registration')), // URL untuk cetak
        // --- PENAMBAHAN: Tambahkan data yang hilang ---
        'adminUrl' => esc_url_raw(admin_url()),
        'is_wp_admin' => $is_wp_admin,
        // --- AKHIR PENAMBAHAN ---
    ]);
}