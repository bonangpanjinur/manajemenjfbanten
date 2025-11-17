<?php
// File: includes/api/api-stats.php
// Mengelola endpoint untuk statistik dashboard.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_action('rest_api_init', 'umh_register_stats_routes');

function umh_register_stats_routes() {
    $namespace = 'umh/v1'; // Namespace baru yang konsisten

    // PERBAIKAN: Tentukan izin (baca-saja)
    // --- PERBAIKAN: Menyimpan array role, bukan memanggil fungsi ---
    $read_permissions_roles = ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'];
    // --- AKHIR PERBAIKAN ---

    // Endpoint untuk statistik total
    register_rest_route($namespace, '/stats/totals', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_total_stats',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($read_permissions_roles) {
                return umh_check_api_permission($request, $read_permissions_roles);
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);

    // Endpoint untuk statistik per paket
    register_rest_route($namespace, '/stats/packages', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_package_stats',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($read_permissions_roles) {
                return umh_check_api_permission($request, $read_permissions_roles);
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);

    // Endpoint untuk statistik keuangan (grafik)
    register_rest_route($namespace, '/stats/finance-chart', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_finance_chart_stats',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($read_permissions_roles) {
                return umh_check_api_permission($request, $read_permissions_roles);
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);
}

// Callback: Get Total Stats
function umh_get_total_stats(WP_REST_Request $request) {
    global $wpdb;
    
    // Menggunakan tabel UMH yang baru
    $jamaah_table = $wpdb->prefix . 'umh_jamaah';
    $packages_table = $wpdb->prefix . 'umh_packages';
    $finance_table = $wpdb->prefix . 'umh_finance';

    // Query menggunakan tabel yang benar
    $total_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM $jamaah_table");
    $total_packages = $wpdb->get_var("SELECT COUNT(*) FROM $packages_table");
    // --- PERBAIKAN: Menggunakan 'type' bukan 'transaction_type' ---
    $total_revenue = $wpdb->get_var("SELECT SUM(amount) FROM $finance_table WHERE type = 'income'");
    $total_expense = $wpdb->get_var("SELECT SUM(amount) FROM $finance_table WHERE type = 'expense'");
    // --- AKHIR PERBAIKAN ---

    $stats = [
        'total_jamaah' => (int) $total_jamaah,
        'total_packages' => (int) $total_packages,
        'total_revenue' => (float) $total_revenue,
        'total_expense' => (float) $total_expense,
        'net_profit' => (float) ($total_revenue - $total_expense),
    ];

    return new WP_REST_Response($stats, 200);
}

// Callback: Get Package Stats
function umh_get_package_stats(WP_REST_Request $request) {
    global $wpdb;
    
    // Menggunakan tabel UMH yang baru
    $jamaah_table = $wpdb->prefix . 'umh_jamaah';
    $packages_table = $wpdb->prefix . 'umh_packages';
    
    // --- PERBAIKAN: Menggunakan 'name' dari tabel paket baru ---
    $query = "
        SELECT p.name as package_name, COUNT(j.id) as jamaah_count
        FROM $packages_table p
        LEFT JOIN $jamaah_table j ON p.id = j.package_id
        GROUP BY p.id
    ";
    // --- AKHIR PERBAIKAN ---
    
    $results = $wpdb->get_results($query, ARRAY_A);
    
    if ($results === false) {
        return new WP_Error('db_error', __('Database error.', 'umh'), ['status' => 500]);
    }

    return new WP_REST_Response($results, 200);
}

// Callback: Get Finance Chart Stats
function umh_get_finance_chart_stats(WP_REST_Request $request) {
    global $wpdb;
    $finance_table = $wpdb->prefix . 'umh_finance';
    
    // --- PERBAIKAN: Menggunakan 'type' bukan 'transaction_type' ---
    $query = "
        SELECT 
            DATE_FORMAT(transaction_date, '%Y-%m') as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM $finance_table
        GROUP BY month
        ORDER BY month ASC
        LIMIT 12
    ";
    // --- AKHIR PERBAIKAN ---
    
    $results = $wpdb->get_results($query, ARRAY_A);
    
    if ($results === false) {
        return new WP_Error('db_error', __('Database error.', 'umh'), ['status' => 500]);
    }

    return new WP_REST_Response($results, 200);
}