<?php
/**
 * Plugin Name: Manajemen JF Banten (Umroh Manager Hybrid)
 * Description: Plugin manajemen travel umroh hybrid (React + WP) dengan fitur Keuangan, Jamaah, dan Paket Dinamis.
 * Version: 1.1.0
 * Author: Bonang Panji Nur
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Definisikan konstanta
define( 'UMH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'UMH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
// Bump version ke 1.1 untuk memicu update database
define( 'UMH_DB_VERSION', '1.1' ); 

// Include file-file penting
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/utils.php';

// Include API Handlers (Akan di-refactor nanti menjadi REST API Controller)
require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-auth.php'; // Pastikan file ini ada atau sesuaikan
require_once UMH_PLUGIN_DIR . 'includes/api/api-master-data.php'; // Placeholder untuk master data baru

// Registrasi Hook Aktivasi untuk membuat tabel
register_activation_hook( __FILE__, 'umh_create_tables' );

// Fungsi untuk mengecek update database saat plugin dimuat (opsional tapi disarankan)
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
        'manage_options',
        'umroh-manager',
        'umh_render_admin_page',
        'dashicons-groups', // Icon
        6
    );
}
add_action( 'admin_menu', 'umh_add_admin_menu' );

function umh_render_admin_page() {
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
}

// Enqueue Script React
function umh_enqueue_scripts( $hook ) {
    if ( $hook != 'toplevel_page_umroh-manager' ) {
        return;
    }

    $asset_file = include( UMH_PLUGIN_DIR . 'build/index.asset.php' );

    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'umh-react-style',
        UMH_PLUGIN_URL . 'build/index.css',
        array(),
        $asset_file['version']
    );

    // Localize script untuk mengirim data awal ke React
    wp_localize_script( 'umh-react-app', 'umhData', array(
        'apiUrl'   => home_url( '/wp-json/umh/v1/' ), // Rencana endpoint REST API
        'nonce'    => wp_create_nonce( 'wp_rest' ),
        'siteUrl'  => get_site_url(),
        'adminUrl' => admin_url(),
        'currentUser' => wp_get_current_user()
    ) );
}
add_action( 'admin_enqueue_scripts', 'umh_enqueue_scripts' );

// Handling CORS (Jika diperlukan untuk pengembangan local)
require_once UMH_PLUGIN_DIR . 'includes/cors.php';