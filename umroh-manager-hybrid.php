<?php
/**
 * Plugin Name:       Umroh Manager Hybrid
 * Plugin URI:        https://github.com/bonangpanjinur/umroh-manager-hybrid
 * Description:       A hybrid plugin (PHP Backend + React Frontend) for managing Umroh packages, jamaah, and finances within the WordPress admin.
 * Version:           1.0.0
 * Author:            Bonang Panji Nur
 * Author URI:        https://bonang.me
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       umroh-manager-hybrid
 * Domain Path:       /languages
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define Constants
define('UMH_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_PLUGIN_VERSION', '1.0.0');

// Includes
require_once(UMH_PLUGIN_PATH . 'includes/db-schema.php');
require_once(UMH_PLUGIN_PATH . 'includes/utils.php');
require_once(UMH_PLUGIN_PATH . 'includes/class-umh-crud-controller.php');

// Activation Hook
register_activation_hook(__FILE__, 'umh_create_tables');

// Admin Menu & Settings
require_once(UMH_PLUGIN_PATH . 'admin/dashboard-react.php');
require_once(UMH_PLUGIN_PATH . 'admin/settings-page.php');
require_once(UMH_PLUGIN_PATH . 'admin/print-registration.php'); // Halaman Print

// --- PENAMBAHAN: Registrasi Menu Admin ---

/**
 * Mendaftarkan halaman menu admin di sidebar WordPress.
 */
function umh_register_admin_menu() {
    // 1. Halaman Dashboard Utama (React App)
    add_menu_page(
        __('Umroh Manager Dashboard', 'umroh-manager-hybrid'), // Judul Halaman
        __('Umroh Manager', 'umroh-manager-hybrid'),          // Judul Menu
        'manage_options',                                     // Kapabilitas (minimal) - Nanti bisa disesuaikan
        'umroh-manager-hybrid',                               // Menu Slug (PENTING: Ini adalah 'page' slug)
        'umh_render_react_dashboard',                         // Fungsi callback untuk render div#root
        'dashicons-airplane',                                 // Ikon
        20                                                    // Posisi
    );

    // 2. Halaman Pengaturan (Submenu)
    add_submenu_page(
        'umroh-manager-hybrid',                               // Parent slug
        __('Pengaturan', 'umroh-manager-hybrid'),             // Judul Halaman
        __('Pengaturan', 'umroh-manager-hybrid'),             // Judul Menu
        'manage_options',                                     // Kapabilitas
        'umh-settings',                                       // Menu Slug
        'umh_render_settings_page'                            // Fungsi callback
    );
}
add_action('admin_menu', 'umh_register_admin_menu');

/**
 * Mendaftarkan fields untuk halaman pengaturan.
 */
function umh_register_admin_settings() {
    // Kita perlu memanggil class dari 'admin/settings-page.php'
    if (class_exists('UMH_Settings_Page')) {
        $settings_page = new UMH_Settings_Page();
        $settings_page->register_settings(); // Menggunakan metode register_settings dari class
    }
}
add_action('admin_init', 'umh_register_admin_settings');

// --- AKHIR PENAMBAHAN ---


// Include file-file API
require_once(UMH_PLUGIN_PATH . 'includes/api/api-stats.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-users.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-roles.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-hr.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-packages.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-departures.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-hotels.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-flights.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-jamaah.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-jamaah-payments.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-finance.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-categories.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-marketing.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-tasks.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-uploads.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-logs.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-export.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-print.php');

// CORS Handling
require_once(UMH_PLUGIN_PATH . 'includes/cors.php');

/**
 * Daftarkan semua Rute API
 */
function umh_register_api_routes() {
    $stats_controller = new UMH_Stats_Controller();
    $stats_controller->register_routes();

    $users_controller = new UMH_Users_Controller();
    $users_controller->register_routes();

    $roles_controller = new UMH_Roles_Controller();
    $roles_controller->register_routes();

    $hr_controller = new UMH_HR_Controller();
    $hr_controller->register_routes();

    $packages_controller = new UMH_Packages_Controller();
    $packages_controller->register_routes();

    $departures_controller = new UMH_Departures_Controller();
    $departures_controller->register_routes();

    $hotels_controller = new UMH_Hotels_Controller();
    $hotels_controller->register_routes();

    $flights_controller = new UMH_Flights_Controller();
    $flights_controller->register_routes();

    $jamaah_controller = new UMH_Jamaah_Controller();
    $jamaah_controller->register_routes();

    $payments_controller = new UMH_Jamaah_Payments_Controller();
    $payments_controller->register_routes();

    $finance_controller = new UMH_Finance_Controller();
    $finance_controller->register_routes();

    $categories_controller = new UMH_Categories_Controller();
    $categories_controller->register_routes();

    $marketing_controller = new UMH_Marketing_Controller();
    $marketing_controller->register_routes();

    // PERBAIKAN: Menghapus typo 'semog'
    $tasks_controller = new UMH_Tasks_Controller();
    $tasks_controller->register_routes();

    $uploads_controller = new UMH_Uploads_Controller();
    $uploads_controller->register_routes();

    $logs_controller = new UMH_Logs_Controller();
    $logs_controller->register_routes();
    
    $export_controller = new UMH_Export_Controller();
    $export_controller->register_routes();
    
    $print_controller = new UMH_Print_Controller();
    $print_controller->register_routes();
}
add_action('rest_api_init', 'umh_register_api_routes');

/**
 * Enqueue scripts and styles for the admin dashboard.
 */
function umh_enqueue_admin_scripts($hook) {
    
    // Tentukan hook untuk halaman print
    $print_page_hook = 'admin_page_umh-print-registration';

    // Cek apakah hook adalah salah satu halaman plugin kita
    if ('toplevel_page_umroh-manager-hybrid' != $hook && 
        'umroh-manager_page_umh-settings' != $hook &&
        $print_page_hook != $hook
    ) {
        return;
    }

    // Khusus untuk halaman print, load CSS print
    if ($print_page_hook == $hook) {
        wp_enqueue_style(
            'umh-print-style',
            UMH_PLUGIN_URL . 'assets/css/admin-style.css', // Sesuaikan jika ada file css khusus print
            array(),
            UMH_PLUGIN_VERSION
        );
        return; // Jangan load React di halaman print
    }

    // Untuk halaman React
    $asset_file = include(UMH_PLUGIN_PATH . 'build/index.asset.php');

    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'umh-admin-style',
        UMH_PLUGIN_URL . 'assets/css/admin-style.css',
        array(),
        UMH_PLUGIN_VERSION
    );

    // Loloskan data dari PHP ke React
    umh_localize_script();
}
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');