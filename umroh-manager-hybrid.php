<?php
/*
Plugin Name: Umroh Manager Hybrid
Description: Sistem Manajemen Travel Umroh
Version: 1.1.0
Author: Bonang Panji Nur
*/

if (!defined('ABSPATH')) exit;

define('UMH_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// 1. Core Includes (Database & Utils)
require_once UMH_PLUGIN_PATH . 'includes/db-schema.php';
require_once UMH_PLUGIN_PATH . 'includes/utils.php';
require_once UMH_PLUGIN_PATH . 'includes/class-umh-crud-controller.php';
require_once UMH_PLUGIN_PATH . 'includes/cors.php';

// 2. API Includes (Memuat SEMUA API agar tidak ada fitur hilang)
// -- API Utama
require_once UMH_PLUGIN_PATH . 'includes/api/api-users.php';
require_once UMH_PLUGIN_PATH . 'includes/api/api-packages.php';
require_once UMH_PLUGIN_PATH . 'includes/api/api-jamaah.php';
require_once UMH_PLUGIN_PATH . 'includes/api/api-finance.php';
require_once UMH_PLUGIN_PATH . 'includes/api/api-marketing.php';
require_once UMH_PLUGIN_PATH . 'includes/api/api-sub-agents.php';
require_once UMH_PLUGIN_PATH . 'includes/api/api-hr.php';
require_once UMH_PLUGIN_PATH . 'includes/api/api-stats.php';

// -- API Fitur Pendukung (Penting agar fitur lama tetap jalan)
require_once UMH_PLUGIN_PATH . 'includes/api/api-uploads.php';       // Untuk upload file
require_once UMH_PLUGIN_PATH . 'includes/api/api-tasks.php';         // Manajemen tugas
require_once UMH_PLUGIN_PATH . 'includes/api/api-roles.php';         // Role manajemen
require_once UMH_PLUGIN_PATH . 'includes/api/api-print.php';         // Fitur Cetak/Print
require_once UMH_PLUGIN_PATH . 'includes/api/api-logs.php';          // Log aktivitas
require_once UMH_PLUGIN_PATH . 'includes/api/api-export.php';        // Export Excel/PDF
require_once UMH_PLUGIN_PATH . 'includes/api/api-departures.php';    // Keberangkatan
require_once UMH_PLUGIN_PATH . 'includes/api/api-categories.php';    // Kategori

// -- API Khusus (Legacy & Baru)
// Kita tetap load api-jamaah-payments.php jika ada logika history pembayaran spesifik di sana
if (file_exists(UMH_PLUGIN_PATH . 'includes/api/api-jamaah-payments.php')) {
    require_once UMH_PLUGIN_PATH . 'includes/api/api-jamaah-payments.php';
}

// API Master Data (BARU - Untuk Maskapai & Hotel)
// Catatan: Jika api-hotels.php & api-flights.php lama masih dipakai di frontend lama, biarkan di-load.
// Namun Master Data baru akan menggunakan endpoint baru di api-master-data.php
require_once UMH_PLUGIN_PATH . 'includes/api/api-master-data.php'; 
if (file_exists(UMH_PLUGIN_PATH . 'includes/api/api-hotels.php')) {
    require_once UMH_PLUGIN_PATH . 'includes/api/api-hotels.php';
}
if (file_exists(UMH_PLUGIN_PATH . 'includes/api/api-flights.php')) {
    require_once UMH_PLUGIN_PATH . 'includes/api/api-flights.php';
}

// 3. Activation Hook (Membuat Tabel Database)
register_activation_hook(__FILE__, 'umh_create_tables');

// 4. Admin Menu & React Integration
require_once UMH_PLUGIN_PATH . 'admin/dashboard-react.php';

function umh_enqueue_scripts($hook) {
    // Hanya load di halaman plugin ini
    if ($hook != 'toplevel_page_umroh-manager-hybrid') return;

    $asset_file = include(UMH_PLUGIN_PATH . 'build/index.asset.php');

    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );
    
    // Siapkan data user saat ini untuk dikirim ke React
    $current_user = wp_get_current_user();
    
    // Logika Role Sederhana (Fallback jika tabel HR belum ada data)
    $role = 'staff';
    if (in_array('administrator', $current_user->roles)) {
        $role = 'owner';
    }
    
    wp_localize_script('umh-react-app', 'umh_wp_data', [
        'api_url' => rest_url('umh/v1/'),
        'nonce' => wp_create_nonce('wp_rest'),
        'user' => [
            'id' => $current_user->ID,
            'name' => $current_user->display_name,
            'email' => $current_user->user_email,
            'role' => $role
        ],
        'plugin_url' => UMH_PLUGIN_URL
    ]);

    wp_enqueue_style('umh-style', UMH_PLUGIN_URL . 'build/index.css');
}
add_action('admin_enqueue_scripts', 'umh_enqueue_scripts');