<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI: https://bonang.dev/
 * Description: Plugin hybrid untuk manajemen travel umroh, menggabungkan WP Admin dengan React App.
 * Version: 1.0.1
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
define('UMH_VERSION', '1.0.1');
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

    // --- PERBAIKAN (Dashboard UI): Tambahkan script Tailwind CSS CDN ---
    // Ini akan memperbaiki masalah UI yang rusak di dalam dashboard React Anda.
    wp_enqueue_script('umh-tailwind-cdn', 'https://cdn.tailwindcss.com', array(), null, false);
    // --- AKHIR PERBAIKAN ---

    // Pass data dari PHP ke React
    $current_user = wp_get_current_user();
    $user_roles = (array) $current_user->roles;
    $primary_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';

    // --- PERBAIKAN: Mengubah nama objek dan kunci agar sesuai dengan build/index.js ---
    wp_localize_script(
        'umh-admin-react-app',
        'umh_wp_data', // DIUBAH: dari 'umhApiSettings'
        array(
            'api_url' => esc_url_raw(rest_url('umh/v1')), // DIUBAH: dari 'apiUrl'
            'api_nonce' => wp_create_nonce('wp_rest'), // DIUBAH: dari 'nonce'
            'is_wp_admin' => true, // DIUBAH: dari 'isWpAdmin'
            'current_user' => array( // DIUBAH: dari 'currentUser'
                'id' => $current_user->ID,
                'user_email' => $current_user->user_email,
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
// PERBAIKAN MENYELURUH (HYBRID UI, LOGIN, & KEAMANAN API)
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
 * PERBAIKAN (Hybrid UI): Mengatur UI Admin berdasarkan Role Pengguna.
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
        // Kita gunakan prioritas tinggi (999) agar berjalan setelah menu utama dibuat
        add_action('admin_menu', function() {
            // Hapus semua menu default
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
            
            // Hapus menu Pengaturan bawaan plugin kita, karena staff harusnya tidak lihat
            remove_submenu_page('umroh-manager-hybrid', 'umh-settings');
        }, 999);
        
        // 3. Alihkan (redirect) jika mereka mencoba mengakses halaman admin lain
        // Kecuali halaman utama plugin kita
        $allowed_pages = array('admin.php');
        $allowed_query_page = 'umroh-manager-hybrid'; // Halaman React utama
        $is_allowed_page = false;

        if (in_array($pagenow, $allowed_pages) && isset($_GET['page']) && $_GET['page'] === $allowed_query_page) {
             $is_allowed_page = true;
        }
        
        // Jika mereka ada di halaman admin TAPI BUKAN halaman React kita,
        // dan BUKAN halaman logout, alihkan mereka.
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
 * PERBAIKAN (Login Logo): Mengganti logo di halaman login dengan Site Icon.
 */
function umh_custom_login_logo() {
    $site_icon_url = get_site_icon_url();
    if ($site_icon_url) {
        ?>
        <style type"text/css">
            #login h1 a, .login h1 a {
                background-image: url(<?php echo esc_url($site_icon_url); ?>);
                height: 84px; /* Default logo WP */
                width: 84px; /* Default logo WP */
                background-size: 84px 84px;
                background-repeat: no-repeat;
                padding-bottom: 30px;
                width: 100%; /* Agar center */
            }
        </style>
        <?php
    }
}
add_action('login_enqueue_scripts', 'umh_custom_login_logo');

/**
 * PERBAIKAN (Login Logo): Mengganti URL tautan logo di halaman login ke 'home_url'.
 */
function umh_custom_login_logo_url($url) {
    return home_url('/');
}
add_filter('login_headerurl', 'umh_custom_login_logo_url');

/**
 * PERBAIKAN (Login Logo): Mengganti teks 'title' logo di halaman login dengan nama situs.
 */
function umh_custom_login_logo_title() {
    return get_bloginfo('name');
}
add_filter('login_headertext', 'umh_custom_login_logo_title');


/**
 * PERBAIKAN (Keamanan CRUD): Fungsi Pengecekan Izin API yang spesifik berdasarkan Role.
 * Menghasilkan fungsi 'permission_callback' yang dapat digunakan ulang.
 *
 * @param array $allowed_roles Role-role staff yang diizinkan (misal: ['finance_staff', 'admin_staff']).
 * 'administrator' dan 'owner' selalu diizinkan secara default.
 * @return callable Fungsi yang akan digunakan oleh 'permission_callback'.
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

        // 1. Super Admin (administrator) selalu punya akses penuh.
        if (in_array('administrator', $user_roles)) {
            return true;
        }

        // 2. Owner selalu punya akses penuh.
        if (in_array('owner', $user_roles)) {
            return true;
        }

        // 3. Periksa role staff yang diizinkan
        foreach ($user_roles as $role) {
            if (in_array($role, $allowed_roles)) {
                return true;
            }
        }
        
        // Jika tidak ada role yang cocok
        return new WP_Error('rest_forbidden_role', __('Role Anda tidak memiliki izin untuk mengakses sumber daya ini.', 'umroh-manager-hybrid'), array('status' => 403));
    };
}

/**
 * PERBAIKAN (Keamanan CRUD): Pengecekan izin yang lebih ketat, khusus untuk Super Admin.
 * (Contoh: untuk endpoint pengaturan plugin, manajemen role, dll.)
 *
 * @param WP_REST_Request $request
 * @return bool|WP_Error
 */
function umh_api_admin_permission_check(WP_REST_Request $request) {
    if (!current_user_can('manage_options')) {
         return new WP_Error('rest_forbidden_admin', __('Hanya Super Administrator yang dapat mengakses endpoint ini.', 'umroh-manager-hybrid'), array('status' => 403));
    }
    return true;
}