<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI:  https://example.com/
 * Description: Manages Umroh packages, jamaah, finance, and HR with a hybrid WP-Admin and Headless API approach.
 * Version:     1.3.1
 * Author:      Your Name
 * Author URI:  https://example.com/
 * Text Domain: umh
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// 1. Inisialisasi Database (PENTING: Memuat db-schema.php v1.3)
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';

// 2. Utilitas Inti & Keamanan
require_once UMH_PLUGIN_DIR . 'includes/utils.php';

// 3. Penanganan CORS (jika diperlukan untuk headless)
require_once UMH_PLUGIN_DIR . 'includes/cors.php'; 

// 4. Load Generic CRUD Controller
require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';

// 5. Muat semua file API Endpoints
$api_files = glob(UMH_PLUGIN_DIR . 'includes/api/*.php');
foreach ($api_files as $file) {
    if (basename($file) !== 'api-manifest.php') { // Jangan muat file yang sudah usang
        require_once $file;
    }
}
// Muat API untuk riwayat pembayaran
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah-payments.php';


// 6. Halaman Admin (Dashboard & Pengaturan)
require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';
// (BARU) JANGAN require_once print-registration.php di sini.
// require_once UMH_PLUGIN_DIR . 'admin/print-registration.php'; // Hapus baris ini


// --- HOOKS ---

/**
 * [PERBAIKAN] Menambahkan Halaman Menu Admin
 * Ini adalah versi yang benar untuk mendaftarkan React, Pengaturan, dan Formulir Cetak
 */
function umh_admin_menu_v3() {
    // Halaman Utama (React)
    add_menu_page(
        'Umroh Manager', // Judul Halaman
        'Umroh Manager', // Judul Menu
        'manage_options', // Kapabilitas
        'umroh-manager-dashboard', // Slug Menu
        'umroh_manager_render_dashboard_react', // Fungsi callback (dari admin/dashboard-react.php)
        'dashicons-airplane', // Ikon
        6 // Posisi
    );

    // Submenu: Dashboard (React)
    add_submenu_page(
        'umroh-manager-dashboard', // Slug Induk
        'Dashboard', // Judul Halaman Submenu
        'Dashboard', // Judul Menu Submenu
        'manage_options', // Kapabilitas
        'umroh-manager-dashboard', // Slug Submenu (sama dengan induk)
        'umroh_manager_render_dashboard_react' // Fungsi callback
    );

    // Submenu: Formulir Cetak (Halaman PHP Biasa)
    add_submenu_page(
        'umroh-manager-dashboard', // Slug Induk
        'Formulir Cetak', // Judul Halaman Submenu
        'Formulir Cetak', // Judul Menu Submenu
        'manage_options', // Kapabilitas
        'umh-print-registration', // Slug Submenu
        'umh_render_print_registration_page_callback' // [PENTING] Ini adalah NAMA FUNGSI (string)
    );

    // Submenu: Pengaturan API (Halaman PHP Biasa)
    add_submenu_page(
        'umroh-manager-dashboard', // Slug Induk
        'Pengaturan API', // Judul Halaman Submenu
        'Pengaturan API', // Judul Menu Submenu
        'manage_options', // Kapabilitas
        'umh-settings', // Slug Submenu
        'umh_render_settings_page' // Callback (dari admin/settings-page.php)
    );
}
add_action('admin_menu', 'umh_admin_menu_v3');

/**
 * [PERBAIKAN] Callback untuk merender halaman formulir cetak
 * Fungsi ini HANYA akan dipanggil oleh WordPress saat menu 'umh-print-registration' diklik.
 */
function umh_render_print_registration_page_callback() {
    // Kita include file-nya di sini, bukan di atas.
    include_once UMH_PLUGIN_DIR . 'admin/print-registration.php';
}

// 8. Inisialisasi Halaman Pengaturan
function umh_settings_init() {
    if (class_exists('UMH_Settings_Page')) {
        $umh_settings_page = new UMH_Settings_Page();
        $umh_settings_page->register_settings();
    }
}
add_action('admin_init', 'umh_settings_init');


// 9. Enqueue scripts untuk Admin Dashboard React
function umh_admin_enqueue_scripts($hook) {
    
    // Daftar hook yang valid
    $valid_hooks = [
        'toplevel_page_umroh-manager-dashboard', // Halaman React Utama
        'umroh-manager_page_umh-settings', // Halaman Pengaturan
        'umroh-manager_page_umh-print-registration' // Halaman Cetak
    ];

    if (!in_array($hook, $valid_hooks)) {
        return;
    }
    
    // Muat CSS admin umum untuk semua halaman plugin
    wp_enqueue_style(
        'umh-admin-style',
        UMH_PLUGIN_URL . 'assets/css/admin-style.css',
        [],
        filemtime(UMH_PLUGIN_DIR . 'assets/css/admin-style.css')
    );

    // Hanya muat React di halaman dashboard utama
    // Hook 'toplevel_page_umroh-manager-dashboard' adalah hook yang benar
    if ($hook === 'toplevel_page_umroh-manager-dashboard') {
        $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

        wp_enqueue_script(
            'umh-admin-react-app',
            UMH_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        // Amankan API untuk WP Admin (Super Admin)
        $current_user = wp_get_current_user();
        // [PERBAIKAN] Gunakan fungsi 'umh_is_super_admin' yang sudah ada
        if (umh_is_super_admin()) { 
            wp_localize_script('umh-admin-react-app', 'umh_wp_data', [
                'api_url' => esc_url_raw(rest_url('umh/v1/')),
                'api_nonce' => wp_create_nonce('wp_rest'),
                'is_wp_admin' => true,
                'current_user' => [
                    'wp_user_id' => $current_user->ID,
                    'display_name' => $current_user->display_name,
                    'email' => $current_user->user_email,
                    'role' => 'super_admin',
                ],
            ]);
        }
    }
}
add_action('admin_enqueue_scripts', 'umh_admin_enqueue_scripts');


// 10. Menyajikan Service Worker untuk PWA
function umh_serve_service_worker() {
    if (isset($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] === '/service-worker.js') {
        $sw_file = UMH_PLUGIN_DIR . 'pwa/service-worker.js';
        if (file_exists($sw_file)) {
            header('Content-Type: application/javascript');
            header('Service-Worker-Allowed: /'); 
            readfile($sw_file);
            exit;
        }
    }
    
    if (isset($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] === '/manifest.json') {
        $manifest_file = UMH_PLUGIN_DIR . 'pwa/manifest.json';
        if (file_exists($manifest_file)) {
            header('Content-Type: application/json');
            readfile($manifest_file);
            exit;
        }
    }
}
add_action('parse_request', 'umh_serve_service_worker');

// 11. Inisialisasi CORS
function umh_init_cors() {
    if (class_exists('UMH_CORS')) {
        $umh_cors = new UMH_CORS();
        add_action('rest_api_init', array($umh_cors, 'add_cors_headers'));
    }
}
add_action('init', 'umh_init_cors');