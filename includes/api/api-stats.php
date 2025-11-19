<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
    register_rest_route('umh/v1', '/stats', [
        'methods' => 'GET',
        'callback' => 'umh_get_dashboard_stats',
        'permission_callback' => '__return_true'
    ]);
});

function umh_get_dashboard_stats() {
    global $wpdb;

    // 1. Card Counts
    $total_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah");
    $active_packages = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_packages WHERE status = 'available'");
    
    // 2. Revenue (Hanya status 'income')
    $total_revenue = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance WHERE type = 'income'");

    // 3. Chart Data (Income vs Expense per Bulan)
    // Query ini mengelompokkan data finance berdasarkan bulan
    $chart_sql = "
        SELECT 
            DATE_FORMAT(transaction_date, '%b') as name, 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM {$wpdb->prefix}umh_finance
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
        ORDER BY transaction_date ASC
        LIMIT 6
    ";
    $monthly_stats = $wpdb->get_results($chart_sql);

    return [
        'total_jamaah' => $total_jamaah,
        'active_packages' => $active_packages,
        'total_revenue' => $total_revenue ?: 0,
        'monthly_income' => $monthly_stats
    ];
}