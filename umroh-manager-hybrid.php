<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI: https://bonang.dev/
 * Description: Plugin hybrid untuk manajemen travel umroh, menggabungkan WP Admin dengan React App.
 * Version: 1.0.0
 * Author: Bonang Panji Nur
 * Author URI: https://bonang.dev/
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: umroh-manager-hybrid
 * Domain Path: /languages
 */

// Lokasi: umroh-manager-hybrid.php (file utama plugin)

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Definisikan konstanta plugin
define('UMH_VERSION', '1.0.0');
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_PLUGIN_FILE', __FILE__);

// Include file-file utama
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';
require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';
require_once UMH_PLUGIN_DIR . 'admin/print-registration.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';

// Include semua file API
foreach (glob(UMH_PLUGIN_DIR . 'includes/api/*.php') as $filename) {
    require_once $filename;
}

/**
 * Fungsi yang dijalankan saat aktivasi plugin.
 */
function umh_activate_plugin() {
    // Buat tabel database
    umh_create_tables();
    
    // Tambahkan role kustom jika belum ada
    add_role('owner', 'Owner', get_role('administrator')->capabilities);
    add_role('admin_staff', 'Admin Staff', get_role('editor')->capabilities);
    add_role('finance_staff', 'Finance Staff', get_role('author')->capabilities);
    add_role('marketing_staff', 'Marketing Staff', get_role('contributor')->capabilities);
    add_role('hr_staff', 'HR Staff', get_role('contributor')->capabilities);
}
register_activation_hook(UMH_PLUGIN_FILE, 'umh_activate_plugin');

/**
 * Fungsi yang dijalankan saat deaktivasi plugin.
 */
function umh_deactivate_plugin() {
    // Hapus role kustom
    remove_role('owner');
    remove_role('admin_staff');
    remove_role('finance_staff');
    remove_role('marketing_staff');
    remove_role('hr_staff');
}
register_deactivation_hook(UMH_PLUGIN_FILE, 'umh_deactivate_plugin');

/**
 * Mendaftarkan menu admin.
 */
function umh_admin_menu() {
    add_menu_page(
        __('Umroh Manager', 'umroh-manager-hybrid'),
        'Umroh Manager',
        'read', // Minimal capability
        'umroh-manager-hybrid',
        'umh_render_react_dashboard', // Fungsi callback
        'dashicons-palmtree',
        6
    );

    add_submenu_page(
        'umroh-manager-hybrid',
        __('Pengaturan', 'umroh-manager-hybrid'),
        'Pengaturan',
        'manage_options',
        'umh-settings',
        'umh_render_settings_page'
    );
    
    // Halaman print tersembunyi
    add_submenu_page(
        null, // Parent slug (null untuk tersembunyi)
        __('Cetak Pendaftaran', 'umroh-manager-hybrid'),
        'Cetak Pendaftaran',
        'read',
        'umh-print-registration',
        'umh_render_print_registration_page'
    );
}
add_action('admin_menu', 'umh_admin_menu');

/**
 * Enqueue script dan style untuk halaman admin.
 */
function umh_admin_enqueue_scripts($hook) {
    // Hanya load script di halaman admin plugin kita
    if ('toplevel_page_umroh-manager-hybrid' !== $hook && 'umroh-manager_page_umh-settings' !== $hook) {
        return;
    }

    // Enqueue style admin kustom (jika ada)
    wp_enqueue_style(
        'umh-admin-style',
        UMH_PLUGIN_URL . 'assets/css/admin-style.css',
        array(),
        UMH_VERSION
    );

    // Enqueue React app assets (dari build)
    $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    if (file_exists($asset_file_path)) {
        $assets = require $asset_file_path;
        
        wp_enqueue_script(
            'umh-admin-react-app',
            UMH_PLUGIN_URL . 'build/index.js',
            $assets['dependencies'],
            $assets['version'],
            true // Load di footer
        );

        // Jika ada file CSS terpisah dari build
        if (isset($assets['css']) && !empty($assets['css'])) {
            wp_enqueue_style(
                'umh-admin-react-app-style',
                UMH_PLUGIN_URL . 'build/' . $assets['css'][0],
                array(),
                $assets['version']
            );
        }
    } else {
        // Fallback jika file asset tidak ditemukan
        wp_enqueue_script(
            'umh-admin-react-app',
            UMH_PLUGIN_URL . 'build/index.js',
            array('wp-element', 'wp-i18n', 'wp-components', 'wp-api-fetch'),
            UMH_VERSION,
            true
        );
    }

    // --- PERBAIKAN (Kategori 1, Poin 1): Tambahkan script Tailwind CSS CDN ---
    // Ini akan memperbaiki masalah UI yang rusak berdasarkan screenshot Anda.
    wp_enqueue_script('umh-tailwind-cdn', 'https://cdn.tailwindcss.com', array(), null, false);
    // --- AKHIR PERBAIKAN ---

    // Pass data dari PHP ke React
    $current_user = wp_get_current_user();
    $user_roles = (array) $current_user->roles;
    $primary_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';

    wp_localize_script(
        'umh-admin-react-app',
        'umhApiSettings',
        array(
            'apiUrl' => esc_url_raw(rest_url('umh/v1')),
            'nonce' => wp_create_nonce('wp_rest'),
            'isWpAdmin' => true,
            'currentUser' => array(
                'id' => $current_user->ID,
                'user_email' => $current_user->user_email,
                'full_name' => $current_user->display_name,
                'role' => $primary_role, 
            ),
            'adminUrl' => admin_url(),
            'printUrl' => admin_url('admin.php?page=umh-print-registration'),
        )
    );
}
add_action('admin_enqueue_scripts', 'umh_admin_enqueue_scripts');

/**
 * Mendaftarkan PWA (manifest.json).
 */
function umh_pwa_manifest_link() {
    // Hanya tampilkan di halaman dashboard react kita
    if (isset($_GET['page']) && $_GET['page'] === 'umroh-manager-hybrid') {
        echo '<link rel="manifest" href="' . esc_url(UMH_PLUGIN_URL . 'pwa/manifest.json') . '">';
        echo '<meta name="theme-color" content="#007cba">';
    }
}
add_action('admin_head', 'umh_pwa_manifest_link');