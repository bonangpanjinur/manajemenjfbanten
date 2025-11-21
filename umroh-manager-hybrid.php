<?php
/**
 * Plugin Name: Manajemen JF Banten (Hybrid)
 * Description: Plugin Manajemen Umroh Hybrid (PHP + React)
 * Version: 1.0.0
 * Author: Bonang Panji Nur
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

class UmrohManagerHybrid {
    public function __construct() {
        add_action('admin_menu', array($this, 'register_menus'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Init API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    public function register_menus() {
        $main_slug = 'umroh-manager-hybrid';

        // 1. Menu Utama (Dashboard)
        add_menu_page(
            'Manajemen Umroh',
            'Manajemen Umroh',
            'manage_options',
            $main_slug,
            array($this, 'render_react_app'),
            'dashicons-groups', // Ikon
            6 // Posisi
        );

        // 2. Submenus
        // Trik: Kita gunakan slug dengan parameter '&view=...' agar WordPress tetap menyorot menu yang benar
        // di sidebar, tetapi memuat halaman React yang sama.
        $submenus = [
            'dashboard' => 'Dashboard',
            'jamaah'    => 'Data Jamaah',
            'payments'  => 'Pembayaran',
            'packages'  => 'Paket Umroh',
            'inventory' => 'Inventory',
            'finance'   => 'Keuangan',
            'hr'        => 'HR & Staff',
            'marketing' => 'Marketing',
            'settings'  => 'Pengaturan',
            'logs'      => 'Log Aktivitas'
        ];

        foreach ($submenus as $view_key => $title) {
            // Slug parent harus sama dengan menu utama agar tidak membuat menu duplikat
            // Jika key adalah dashboard, arahkan ke root slug
            $menu_slug = ($view_key === 'dashboard') ? $main_slug : $main_slug . '&view=' . $view_key;
            
            add_submenu_page(
                $main_slug,
                $title,
                $title,
                'manage_options',
                $menu_slug,
                array($this, 'render_react_app')
            );
        }
    }

    public function enqueue_scripts($hook) {
        // Hanya load script di halaman plugin kita
        // Cek apakah hook mengandung slug plugin kita
        if (strpos($hook, 'umroh-manager-hybrid') === false && strpos($hook, 'page_umroh-manager-hybrid') === false) {
            return;
        }

        $build_dir = plugin_dir_url(__FILE__) . 'build/';
        // Fallback versi & dependencies jika file asset belum ada (saat dev)
        $version = '1.0.0';
        $deps = ['wp-element', 'wp-i18n'];

        if (file_exists(plugin_dir_path(__FILE__) . 'build/index.asset.php')) {
            $asset_file = include(plugin_dir_path(__FILE__) . 'build/index.asset.php');
            $version = $asset_file['version'];
            $deps = $asset_file['dependencies'];
        }

        wp_enqueue_script(
            'umh-react-app',
            $build_dir . 'index.js',
            $deps,
            $version,
            true
        );

        wp_enqueue_style(
            'umh-react-style',
            $build_dir . 'index.css',
            array(),
            $version
        );
        
        // Custom Admin CSS untuk memperbaiki layout WP yang berantakan
        wp_enqueue_style(
            'umh-admin-fix',
            plugin_dir_url(__FILE__) . 'assets/css/admin-style.css',
            array(),
            '1.0.0'
        );

        // LOGIKA UTAMA PERBAIKAN:
        // 1. Ambil parameter 'view' dari URL PHP ($_GET)
        // 2. Jika tidak ada, default ke 'dashboard'
        $current_view = isset($_GET['view']) ? sanitize_text_field($_GET['view']) : 'dashboard';

        // 3. Kirim data ini ke React lewat objek global 'umhSettings'
        wp_localize_script('umh-react-app', 'umhSettings', array(
            'rootUrl' => get_site_url(),
            'apiUrl' => get_rest_url(null, 'umh/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'currentView' => $current_view, // <--- INI KUNCINYA, React akan membaca ini
            'adminUrl' => admin_url('admin.php?page=umroh-manager-hybrid')
        ));
    }

    public function render_react_app() {
        // Panggil file container HTML
        require_once plugin_dir_path(__FILE__) . 'admin/dashboard-react.php';
    }

    public function register_rest_routes() {
        // Auto-include semua file API di folder includes/api
        foreach (glob(plugin_dir_path(__FILE__) . 'includes/api/*.php') as $filename) {
            require_once $filename;
        }
    }
}

new UmrohManagerHybrid();