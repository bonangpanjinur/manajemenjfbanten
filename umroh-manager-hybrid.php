<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Description: Sistem Manajemen Travel Umroh Terintegrasi (React Frontend + WP REST API Backend)
 * Version: 2.1.0
 * Author: Bonang Panji Nur
 * Text Domain: umroh-manager-hybrid
 */

if (!defined('ABSPATH')) {
    exit; 
}

// Konstanta Plugin
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_VERSION', '2.1.0');

// 1. Include Core Files (Urutan Sangat Penting)
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php'; // Parent Class harus diload duluan

// 2. Include API Controllers (Pastikan file ini ada)
require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php'; // Tambahkan ini untuk fix Fatal Error
require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah-payments.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-marketing.php'; // Leads
require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php'; // Staff & Roles
require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php'; // WP Users Integration
require_once UMH_PLUGIN_DIR . 'includes/api/api-logs.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-export.php';

// 3. Include Admin Pages
if (is_admin()) {
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
    require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';
    require_once UMH_PLUGIN_DIR . 'admin/print-registration.php';
}

// 4. Aktivasi Plugin (Create Tables)
register_activation_hook(__FILE__, 'umh_activate_plugin');
function umh_activate_plugin() {
    umh_create_tables();
    
    // Set role default jika belum ada
    if (get_option('umh_db_version') !== UMH_VERSION) {
        update_option('umh_db_version', UMH_VERSION);
    }
}

// 5. Enqueue Scripts (React App)
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');
function umh_enqueue_admin_scripts($hook) {
    // Hanya load di halaman plugin kita
    if (strpos($hook, 'umroh-manager') === false) {
        return;
    }

    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

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
        UMH_VERSION
    );

    // Data yang dikirim ke React
    wp_localize_script('umh-react-app', 'umhData', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'adminUrl' => admin_url(),
        'printUrl' => admin_url('admin.php?page=umh-print-registration'),
        'currentUser' => umh_get_current_user_context() // Dari includes/utils.php
    ));
}

// 6. Init REST API
add_action('rest_api_init', 'umh_register_api_routes');
function umh_register_api_routes() {
    // Inisialisasi controller yang menggunakan Class (bukan fungsi prosedural)
    
    // Cek keberadaan class sebelum instansiasi untuk menghindari Fatal Error
    if (class_exists('UMH_Stats_Controller')) {
        $stats_controller = new UMH_Stats_Controller();
        $stats_controller->register_routes();
    }

    // Controller lain jika ada yang berbasis class...
}