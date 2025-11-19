<?php
// File Location: ./umroh-manager-hybrid.php

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

// --- Registrasi Menu Admin ---

/**
 * Mendaftarkan halaman menu admin di sidebar WordPress.
 */
function umh_register_admin_menu() {
    // 1. Halaman Dashboard Utama (React App)
    add_menu_page(
        __('Umroh Manager Dashboard', 'umroh-manager-hybrid'), // Judul Halaman
        __('Umroh Manager', 'umroh-manager-hybrid'),          // Judul Menu
        'manage_options',                                     // Kapabilitas (minimal)
        'umroh-manager-hybrid',                               // Menu Slug
        'umh_render_react_dashboard',                         // Fungsi callback
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
    if (class_exists('UMH_Settings_Page')) {
        $settings_page = new UMH_Settings_Page();
        $settings_page->register_settings();
    }
}
add_action('admin_init', 'umh_register_admin_settings');

// --- Include API Routes ---
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

    // Khusus untuk halaman print, load CSS print saja
    if ($print_page_hook == $hook) {
        wp_enqueue_style(
            'umh-print-style',
            UMH_PLUGIN_URL . 'assets/css/admin-style.css',
            array(),
            UMH_PLUGIN_VERSION
        );
        return;
    }

    // Untuk halaman React
    $asset_file = include(UMH_PLUGIN_PATH . 'build/index.asset.php');

    // 1. Enqueue JS React App
    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // 2. Enqueue CSS Build (Hasil Compile Tailwind)
    // wp-scripts akan mengenerate file index.css jika ada import CSS di entry point
    if (file_exists(UMH_PLUGIN_PATH . 'build/index.css')) {
        wp_enqueue_style(
            'umh-react-style',
            UMH_PLUGIN_URL . 'build/index.css',
            array(),
            $asset_file['version'] // Gunakan version dari asset file agar cache busting jalan
        );
    }

    // 3. Enqueue CSS Manual (Optional, untuk override khusus WP Admin)
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