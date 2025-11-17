<?php
/**
 * Plugin Name:       Umroh Manager Hybrid
 * Plugin URI:        https://bonang.dev/
 * Description:       Plugin hybrid untuk manajemen travel umroh, menggabungkan WP Admin dengan React App.
 * Version:           1.0.3 
 * Author:            Bonang Panji Nur
 * Author URI:        https://bonang.dev/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       umroh-manager-hybrid
 * Domain Path:       /languages
 */

// Lokasi: umroh-manager-hybrid.php (file utama plugin)

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// --- PERBAIKAN: Definisikan konstanta versi & path ---
if (!function_exists('get_file_data')) {
    require_once(ABSPATH . 'wp-admin/includes/file.php');
}
$plugin_data = get_file_data(__FILE__, ['Version' => 'Version'], false);

define('UMH_VERSION', $plugin_data['Version']);
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_PLUGIN_FILE', __FILE__);
define('UMH_VERSION_OPTION', 'umh_plugin_version'); // Opsi database
// --- AKHIR PERBAIKAN ---

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
    // --- PERBAIKAN: Tambahkan Pengecekan Versi (Fix 'Duplicate key') ---
    $current_version = get_option(UMH_VERSION_OPTION);

    // Hanya jalankan jika versi baru atau instalasi pertama
    if ($current_version != UMH_VERSION) {
        // Buat tabel database
        umh_create_tables();
        
        // Tambahkan role kustom jika belum ada
        // Aman dijalankan ulang
        add_role('owner', 'Owner', get_role('administrator')->capabilities);
        add_role('admin_staff', 'Admin Staff', get_role('editor')->capabilities);
        add_role('finance_staff', 'Finance Staff', get_role('author')->capabilities);
        add_role('marketing_staff', 'Marketing Staff', get_role('contributor')->capabilities);
        add_role('hr_staff', 'HR Staff', get_role('contributor')->capabilities);

        // Update versi di database
        update_option(UMH_VERSION_OPTION, UMH_VERSION);
    }
    // --- AKHIR PERBAIKAN ---
}
register_activation_hook(UMH_PLUGIN_FILE, 'umh_activate_plugin');

/**
 * Fungsi yang dijalankan saat deaktivasi plugin.
 */
function umh_deactivate_plugin() {
    // --- PERBAIKAN: JANGAN hapus role saat deaktivasi ---
    // Ini agar role pengguna tidak hilang jika plugin dinonaktifkan sementara.
    // remove_role('owner');
    // remove_role('admin_staff');
    // remove_role('finance_staff');
    // remove_role('marketing_staff');
    // remove_role('hr_staff');
    // --- AKHIR PERBAIKAN ---
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

    // Tambahkan script Tailwind CSS CDN
    wp_enqueue_script('umh-tailwind-cdn', 'https://cdn.tailwindcss.com', array(), null, false);

    // Pass data dari PHP ke React
    $current_user = wp_get_current_user();
    $user_roles = (array) $current_user->roles;
    $primary_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';

    // --- PERBAIKAN: Sesuaikan objek data agar cocok dengan AuthContext.jsx ---
    wp_localize_script(
        'umh-admin-react-app',
        'umh_wp_data', // Nama objek global
        array(
            'api_url' => esc_url_raw(rest_url('umh/v1')),
            'api_nonce' => wp_create_nonce('wp_rest'),
            'is_wp_admin' => !umh_is_staff_user(), // true jika BUKAN staff (misal: Super Admin)
            'current_user' => array( // Objek pengguna
                'id' => $current_user->ID,
                'email' => $current_user->user_email,
                'full_name' => $current_user->display_name,
                'role' => $primary_role, 
            ),
            'adminUrl' => admin_url(),
            'printUrl' => admin_url('admin.php?page=umh-print-registration'),
        )
    );
    // --- AKHIR PERBAIKAN ---
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


// ==================================================================
// FUNGSI UI & KEAMANAN
// ==================================================================

/**
 * Mendapatkan daftar role kustom yang dikelola oleh plugin ini.
 * @return array
 */
function umh_get_staff_roles() {
    return array(
        'owner',
        'admin_staff',
        'finance_staff',
        'marketing_staff',
        'hr_staff'
    );
}

/**
 * Memeriksa apakah pengguna saat ini adalah staff (bukan super admin).
 * @return bool
 */
function umh_is_staff_user() {
    $user = wp_get_current_user();
    $roles = (array) $user->roles;
    
    // Jika dia administrator, dia bukan staff (dia super admin)
    if (in_array('administrator', $roles)) {
        return false;
    }
    
    // Jika dia punya salah satu role kustom, dia adalah staff
    foreach (umh_get_staff_roles() as $staff_role) {
        if (in_array($staff_role, $roles)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Mengatur UI Admin berdasarkan Role Pengguna.
 */
function umh_manage_admin_ui_by_role() {
    // Jangan jalankan logika ini untuk request AJAX
    if (defined('DOING_AJAX') && DOING_AJAX) {
        return;
    }

    // Hanya jalankan jika pengguna adalah 'staff' (bukan Super Admin)
    if (umh_is_staff_user()) {
        global $pagenow;
        
        // 1. Sembunyikan Admin Bar di frontend dan backend
        add_filter('show_admin_bar', '__return_false');
        
        // 2. Sembunyikan semua menu admin
        add_action('admin_menu', function() {
            remove_menu_page('index.php'); // Dashboard
            remove_menu_page('edit.php'); // Posts
            remove_menu_page('upload.php'); // Media
            remove_menu_page('edit.php?post_type=page'); // Pages
            remove_menu_page('edit-comments.php'); // Comments
            remove_menu_page('themes.php'); // Appearance
            remove_menu_page('plugins.php'); // Plugins
            remove_menu_page('users.php'); // Users
            remove_menu_page('tools.php'); // Tools
            remove_menu_page('options-general.php'); // Settings
            remove_menu_page('profile.php'); // Profile
            
            remove_submenu_page('umroh-manager-hybrid', 'umh-settings');
        }, 999);
        
        // 3. Alihkan (redirect) jika mereka mencoba mengakses halaman admin lain
        $allowed_pages = array('admin.php');
        $allowed_query_page = 'umroh-manager-hybrid'; // Halaman React utama
        $is_allowed_page = false;

        if (in_array($pagenow, $allowed_pages) && isset($_GET['page']) && $_GET['page'] === $allowed_query_page) {
             $is_allowed_page = true;
        }
        
        $logout_url_check = 'wp-login.php?action=logout';
        if ( !$is_allowed_page && 
             $pagenow !== 'wp-login.php' && 
             ( ! isset( $_GET['action'] ) || $_GET['action'] !== 'logout' ) &&
             strpos( $_SERVER['REQUEST_URI'], $logout_url_check ) === false
           ) {
            wp_redirect(admin_url('admin.php?page=umroh-manager-hybrid'));
            exit;
        }
    }
}
add_action('admin_init', 'umh_manage_admin_ui_by_role');


/**
 * Mengganti logo di halaman login.
 */
function umh_custom_login_logo() {
    // Style untuk logo di-handle oleh admin-style.css
}
add_action('login_enqueue_scripts', 'umh_custom_login_logo');

/**
 * Mengganti URL tautan logo di halaman login ke 'home_url'.
 */
function umh_custom_login_logo_url($url) {
    return home_url('/');
}
add_filter('login_headerurl', 'umh_custom_login_logo_url');

/**
 * Mengganti teks 'title' logo di halaman login dengan nama situs.
 */
function umh_custom_login_logo_title() {
    return get_bloginfo('name');
}
add_filter('login_headertext', 'umh_custom_login_logo_title');


/**
 * Pengecekan Izin API berdasarkan Role.
 */
function umh_api_check_role($allowed_roles = array()) {
    /**
     * @param WP_REST_Request $request
     * @return bool|WP_Error
     */
    return function(WP_REST_Request $request) use ($allowed_roles) {
        $user = wp_get_current_user();
        
        if (!$user || !$user->ID) {
            return new WP_Error('rest_unauthenticated', __('Anda harus login untuk mengakses data ini.', 'umroh-manager-hybrid'), array('status' => 401));
        }
        
        $user_roles = (array) $user->roles;

        if (in_array('administrator', $user_roles)) {
            return true;
        }
        if (in_array('owner', $user_roles)) {
            return true;
        }
        foreach ($user_roles as $role) {
            if (in_array($role, $allowed_roles)) {
                return true;
            }
        }
        
        return new WP_Error('rest_forbidden_role', __('Role Anda tidak memiliki izin untuk mengakses sumber daya ini.', 'umroh-manager-hybrid'), array('status' => 403));
    };
}

/**
 * Pengecekan izin khusus untuk Super Admin.
 */
function umh_api_admin_permission_check(WP_REST_Request $request) {
    if (!current_user_can('manage_options')) {
         return new WP_Error('rest_forbidden_admin', __('Hanya Super Administrator yang dapat mengakses endpoint ini.', 'umroh-manager-hybrid'), array('status' => 403));
    }
    return true;
}