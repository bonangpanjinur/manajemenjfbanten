<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI: https://bonangpanjinur.com
 * Description: Sistem Manajemen Travel Umroh Hybrid (React + PHP)
 * Version: 1.0.0
 * Author: Bonang Panji Nur
 * Author URI: https://bonangpanjinur.com
 * License: GPL v2 or later
 * Text Domain: umroh-manager-hybrid
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'UMH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'UMH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

class Umroh_Manager_Hybrid {

    private static $instance = null;
    private $page_hook_suffix = null; // Variable untuk menyimpan hook halaman

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        // Hooks
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
        
        // Initialize API components
        $this->init_components();
    }

    public function init_components() {
        // Load API endpoints
        require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-roles.php';
        // ... load other API files as needed
    }

    public function add_admin_menu() {
        // Simpan hook suffix yang dikembalikan oleh add_menu_page
        $this->page_hook_suffix = add_menu_page(
            'Manajemen JF Banten', // Page Title
            'Manajemen JF Banten', // Menu Title
            'read',               // Capability (Ubah ke 'read' sementara untuk testing, nanti kembalikan ke 'manage_options')
            'umroh-manager-hybrid', // Menu Slug
            array( $this, 'display_admin_dashboard' ), // Callback
            'dashicons-groups',    // Icon
            6                      // Position
        );
    }

    public function display_admin_dashboard() {
        require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
    }

    public function enqueue_admin_assets( $hook ) {
        // Validasi Hook yang lebih ketat dan akurat
        // Jika hook saat ini TIDAK SAMA dengan hook halaman plugin kita, stop.
        if ( $this->page_hook_suffix !== $hook ) {
            return;
        }

        $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';

        if ( ! file_exists( $asset_file_path ) ) {
            // Error handling jika build belum dijalankan
            wp_die( 'File aset React tidak ditemukan. Silakan jalankan `npm run build`.' );
        }

        $asset_file = include( $asset_file_path );

        // Enqueue CSS
        wp_enqueue_style( 
            'umh-react-style', 
            UMH_PLUGIN_URL . 'build/index.css', 
            array(), 
            $asset_file['version'] 
        );
        
        // Fix untuk konflik CSS WordPress Admin
        wp_enqueue_style( 
            'umh-admin-overrides', 
            UMH_PLUGIN_URL . 'assets/css/admin-style.css', 
            array(), 
            '1.0.0' 
        );

        // Enqueue JS
        wp_enqueue_script( 
            'umh-react-app', 
            UMH_PLUGIN_URL . 'build/index.js', 
            array( 'wp-element', 'wp-i18n', 'wp-components', 'wp-api-fetch' ), 
            $asset_file['version'], 
            true // Load di footer
        );

        // Localize Script - Kirim data PHP ke JS
        wp_localize_script( 'umh-react-app', 'umhSettings', array(
            'root'      => esc_url_raw( rest_url() ),
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'adminUrl'  => admin_url( 'admin.php?page=umroh-manager-hybrid' ),
            'assetsUrl' => UMH_PLUGIN_URL . 'assets/',
            'userId'    => get_current_user_id(),
            'userRoles' => wp_get_current_user()->roles
        ) );
    }
}

// Initialize Plugin
Umroh_Manager_Hybrid::get_instance();