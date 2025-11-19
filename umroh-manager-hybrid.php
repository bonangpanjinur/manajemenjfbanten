<?php
// File Location: ./umroh-manager-hybrid.php

/**
 * Plugin Name:       Umroh Manager Hybrid
 * Description:       Plugin manajemen umroh lengkap (Paket, Jamaah, Keuangan, HR, Marketing, Sub Agen).
 * Version:           1.0.1
 * Author:            Bonang Panji Nur
 * Text Domain:       umroh-manager-hybrid
 */

if (!defined('ABSPATH')) {
    exit; 
}

define('UMH_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_PLUGIN_VERSION', '1.0.1');

// ------------------------------------------------------------------------
// 1. Core Includes & Utilities
// ------------------------------------------------------------------------
require_once(UMH_PLUGIN_PATH . 'includes/db-schema.php');
require_once(UMH_PLUGIN_PATH . 'includes/utils.php');
require_once(UMH_PLUGIN_PATH . 'includes/class-umh-crud-controller.php');
require_once(UMH_PLUGIN_PATH . 'includes/cors.php');

// ------------------------------------------------------------------------
// 2. Activation Hook (Database Creation)
// ------------------------------------------------------------------------
register_activation_hook(__FILE__, 'umh_create_tables');

// ------------------------------------------------------------------------
// 3. Admin Pages & Menu
// ------------------------------------------------------------------------
require_once(UMH_PLUGIN_PATH . 'admin/dashboard-react.php');
require_once(UMH_PLUGIN_PATH . 'admin/settings-page.php');
require_once(UMH_PLUGIN_PATH . 'admin/print-registration.php');

function umh_register_admin_menu() {
    // Menu Utama (React App)
    add_menu_page(
        'Umroh Manager', 
        'Umroh Manager', 
        'manage_options', 
        'umroh-manager-hybrid', 
        'umh_render_react_dashboard', 
        'dashicons-airplane', 
        20
    );
    
    // Submenu Pengaturan
    add_submenu_page(
        'umroh-manager-hybrid',
        'Pengaturan',
        'Pengaturan',
        'manage_options',
        'umh-settings',
        'umh_render_settings_page'
    );
}
add_action('admin_menu', 'umh_register_admin_menu');

// ------------------------------------------------------------------------
// 4. API Routes Includes
// ------------------------------------------------------------------------
// Pastikan semua file API di-load agar endpoint tersedia
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
require_once(UMH_PLUGIN_PATH . 'includes/api/api-sub-agents.php'); // Baru: Sub Agen API

// ------------------------------------------------------------------------
// 5. Asset Enqueue (React & CSS)
// ------------------------------------------------------------------------
function umh_enqueue_admin_scripts($hook) {
    $allowed_hooks = [
        'toplevel_page_umroh-manager-hybrid',
        'umroh-manager_page_umh-settings',
        'admin_page_umh-print-registration'
    ];

    if (!in_array($hook, $allowed_hooks)) {
        return;
    }

    // Khusus Halaman Print
    if ($hook === 'admin_page_umh-print-registration') {
        wp_enqueue_style('umh-print-style', UMH_PLUGIN_URL . 'assets/css/admin-style.css', [], UMH_PLUGIN_VERSION);
        return;
    }

    // Cek keberadaan file asset (build)
    $asset_file_path = UMH_PLUGIN_PATH . 'build/index.asset.php';
    
    if (file_exists($asset_file_path)) {
        $asset_file = include($asset_file_path);
    } else {
        // Fallback jika belum di-build
        $asset_file = [
            'dependencies' => ['wp-element', 'wp-i18n', 'wp-api-fetch'],
            'version' => UMH_PLUGIN_VERSION
        ];
    }

    // Enqueue React App
    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // Enqueue Styles
    if (file_exists(UMH_PLUGIN_PATH . 'build/index.css')) {
        wp_enqueue_style('umh-react-style', UMH_PLUGIN_URL . 'build/index.css', [], $asset_file['version']);
    }
    
    // Custom Admin CSS (Optional override)
    if (file_exists(UMH_PLUGIN_PATH . 'assets/css/admin-style.css')) {
        wp_enqueue_style('umh-admin-style', UMH_PLUGIN_URL . 'assets/css/admin-style.css', [], UMH_PLUGIN_VERSION);
    }

    // Kirim data ke JS (Nonce, URL, dll) - Fungsi ini ada di includes/utils.php
    if (function_exists('umh_localize_script')) {
        umh_localize_script();
    }
}
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');