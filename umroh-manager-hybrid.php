<?php
/*
Plugin Name: Umroh Manager Hybrid
Plugin URI: https://github.com/bonangpanjinur/manajemenjfbanten
Description: Sistem Manajemen Travel Umrah Lengkap (Enterprise Grade) dengan Dashboard React, Keuangan, HR, Inventory, dan Cabang.
Version: 2.1
Author: Bonang Panji Nur
Author URI: https://github.com/bonangpanjinur
Text Domain: umroh-manager
*/

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. Define Constants
define( 'UMH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'UMH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'UMH_DB_VERSION', '2.1' ); // Versi DB dinaikkan untuk memicu dbDelta baru

// 2. Include Core Files
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-logger.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';

// 3. Include API Controllers (Semua Modul)
require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah-payments.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php';      // Modul Keuangan
require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php';           // Modul HR
require_once UMH_PLUGIN_DIR . 'includes/api/api-inventory.php';    // Modul Inventory
require_once UMH_PLUGIN_DIR . 'includes/api/api-branches.php';     // Modul Cabang
require_once UMH_PLUGIN_DIR . 'includes/api/api-attendance.php';   // Modul Presensi
require_once UMH_PLUGIN_DIR . 'includes/api/api-master-data.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-categories.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-sub-agents.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-rooming.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-logs.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php';
// require_once UMH_PLUGIN_DIR . 'includes/api/api-marketing.php'; // Uncomment jika sudah ada
// require_once UMH_PLUGIN_DIR . 'includes/api/api-uploads.php';   // Uncomment jika sudah ada

// 4. Include Admin Cleanup (White Label untuk Staff/Owner)
if ( is_admin() ) {
    require_once UMH_PLUGIN_DIR . 'includes/admin-cleanup.php';
}

/**
 * Main Plugin Class
 */
class Umroh_Manager_Hybrid {

    public function __construct() {
        // Init Hook
        add_action( 'init', [ $this, 'init' ] );
        
        // Admin Menu
        add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        
        // Enqueue Scripts (React)
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_scripts' ] );
        
        // REST API Init
        add_action( 'rest_api_init', [ $this, 'register_api_controllers' ] );

        // Handle CORS
        add_action( 'init', 'umh_handle_cors' );
    }

    public function init() {
        // Load text domain jika perlu translation
        load_plugin_textdomain( 'umroh-manager', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }

    /**
     * Register Menu Admin
     * Menu utama yang akan memuat aplikasi React
     */
    public function add_admin_menu() {
        add_menu_page(
            'Umroh Manager',        // Page Title
            'Umroh Manager',        // Menu Title
            'read',                 // Capability (Ubah ke 'read' agar Staff/Owner bisa akses)
            'umrah-manager',        // Menu Slug
            [ $this, 'render_admin_page' ], // Callback function
            'dashicons-palmtree',   // Icon
            2                       // Position
        );
    }

    /**
     * Render Halaman Admin (Wadah untuk React App)
     */
    public function render_admin_page() {
        // Cek permission basic
        if ( ! current_user_can( 'read' ) ) {
            return;
        }

        // Container div tempat React akan dimount
        echo '<div id="umrah-manager-app"></div>';
    }

    /**
     * Enqueue React Scripts & Styles
     */
    public function enqueue_admin_scripts( $hook ) {
        // Hanya load di halaman plugin kita
        if ( 'toplevel_page_umrah-manager' !== $hook ) {
            return;
        }

        // Load Asset file yang digenerate wp-scripts
        $asset_file = include( UMH_PLUGIN_DIR . 'build/index.asset.php' );

        // Enqueue Script Utama (React)
        wp_enqueue_script(
            'umrah-manager-app',
            UMH_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        // Enqueue Style Utama
        wp_enqueue_style(
            'umrah-manager-style',
            UMH_PLUGIN_URL . 'build/index.css',
            [],
            $asset_file['version']
        );

        // Custom Admin CSS (Fix layout WP Admin)
        wp_enqueue_style(
            'umrah-manager-admin-fix',
            UMH_PLUGIN_URL . 'assets/css/admin-style.css',
            [],
            '1.0'
        );

        // Localize Script (Kirim data PHP ke JS)
        wp_localize_script( 'umrah-manager-app', 'umhData', [
            'rootUrl' => get_rest_url( null, 'umh/v1' ),
            'nonce'   => wp_create_nonce( 'wp_rest' ),
            'currentUser' => wp_get_current_user(),
            'settings' => [
                'currency' => 'IDR',
                'logo' => UMH_PLUGIN_URL . 'assets/images/logo.png'
            ]
        ]);
    }

    /**
     * Register All API Controllers
     * Mendaftarkan route untuk semua modul
     */
    public function register_api_controllers() {
        $controllers = [
            new UMH_API_Users(),
            new UMH_API_Packages(),
            new UMH_API_Categories(), // Kategori
            new UMH_API_Jamaah(),
            new UMH_API_Jamaah_Payments(),
            new UMH_API_Sub_Agents(),
            new UMH_API_Rooming(),
            new UMH_API_Logs(),
            new UMH_API_Stats(),
            new UMH_API_Master_Data(),
            
            // --- Modul Enterprise Baru ---
            new UMH_API_Finance(),    // Keuangan & Buku Besar
            new UMH_API_HR(),         // HR & Karyawan
            new UMH_API_Inventory(),  // Logistik
            new UMH_API_Branches(),   // Cabang
            new UMH_API_Attendance()  // Presensi
        ];

        foreach ( $controllers as $controller ) {
            $controller->register_routes();
        }
    }
}

// Initialize Plugin
new Umroh_Manager_Hybrid();

/**
 * Activation Hook
 * Dijalankan saat plugin pertama kali diaktifkan
 */
register_activation_hook( __FILE__, 'umh_activate_plugin' );

function umh_activate_plugin() {
    // 1. Buat Tabel Database
    umh_create_tables();
    
    // 2. Buat Role Khusus (Untuk White Label Login)
    
    // Role Owner: Akses penuh ke App, tapi terbatas di WP Admin
    add_role(
        'umh_owner',
        __('Travel Owner'),
        [
            'read'         => true,  // Wajib true agar bisa login
            'edit_posts'   => false,
            'delete_posts' => false,
            'manage_umh'   => true,  // Custom capability
            'upload_files' => true,  // Izin upload bukti bayar/foto
        ]
    );

    // Role Staff: Akses operasional standar
    add_role(
        'umh_staff',
        __('Travel Staff'),
        [
            'read'         => true,
            'edit_posts'   => false,
            'delete_posts' => false,
            'manage_umh'   => true,
            'upload_files' => true,
        ]
    );
    
    // 3. Simpan Versi DB
    add_option( 'umh_db_version', UMH_DB_VERSION );
    
    // Trigger log
    if (class_exists('UMH_Logger')) {
        UMH_Logger::log(0, 'system', 'plugin_activation', 0, 'Plugin Activated');
    }
}

/**
 * Update Check Hook (Opsional)
 * Cek jika versi plugin berubah, jalankan update DB
 */
add_action( 'plugins_loaded', 'umh_check_version' );
function umh_check_version() {
    if ( get_option( 'umh_db_version' ) != UMH_DB_VERSION ) {
        umh_create_tables();
        update_option( 'umh_db_version', UMH_DB_VERSION );
    }
}