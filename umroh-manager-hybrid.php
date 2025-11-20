<?php
/**
 * Plugin Name: Manajemen JF Banten (Umroh Manager Hybrid)
 * Description: Plugin manajemen travel umroh hybrid (React + WP) dengan fitur Keuangan, Jamaah, dan Paket Dinamis.
 * Version: 1.1.1
 * Author: Bonang Panji Nur
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Definisikan konstanta
define( 'UMH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'UMH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'UMH_DB_VERSION', '1.1' ); 

// Include file-file penting
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/utils.php';

// Include API Handlers
require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-master-data.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-categories.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-sub-agents.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-logs.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-print.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-uploads.php';

// --- PERBAIKAN: Include Dashboard Helper & Settings ---
require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';
require_once UMH_PLUGIN_DIR . 'admin/print-registration.php';

// Registrasi Hook Aktivasi
register_activation_hook( __FILE__, 'umh_create_tables' );

function umh_update_db_check() {
    if ( get_site_option( 'umh_db_version' ) != UMH_DB_VERSION ) {
        umh_create_tables();
    }
}
add_action( 'plugins_loaded', 'umh_update_db_check' );

// Menu Admin
function umh_add_admin_menu() {
    add_menu_page(
        'Manajemen JF Banten',
        'Manajemen JF',
        'read', // Ubah ke 'read' agar staff dengan role rendah bisa melihat menu
        'umroh-manager',
        'umh_render_react_dashboard', // Panggil fungsi dari dashboard-react.php
        'dashicons-groups',
        6
    );

    // Submenu tersembunyi untuk Print
    add_submenu_page(
        null,
        'Cetak Registrasi',
        'Cetak Registrasi',
        'read',
        'umh-print-registration',
        'umh_render_print_registration_page'
    );
}
add_action( 'admin_menu', 'umh_add_admin_menu' );

// Enqueue Script React
function umh_enqueue_scripts( $hook ) {
    // Pastikan hanya load di halaman plugin kita
    if ( $hook != 'toplevel_page_umroh-manager' ) {
        return;
    }

    $asset_file = include( UMH_PLUGIN_DIR . 'build/index.asset.php' );

    // Enqueue JS Build
    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // Enqueue CSS Build
    wp_enqueue_style(
        'umh-react-style',
        UMH_PLUGIN_URL . 'build/index.css',
        array(),
        $asset_file['version']
    );

    // --- PERBAIKAN KRUSIAL: Panggil fungsi localize yang benar ---
    // Fungsi ini ada di admin/dashboard-react.php
    if (function_exists('umh_localize_script')) {
        umh_localize_script();
    }
}
add_action( 'admin_enqueue_scripts', 'umh_enqueue_scripts' );

// Handling CORS
require_once UMH_PLUGIN_DIR . 'includes/cors.php';