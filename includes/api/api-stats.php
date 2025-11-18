<?php
/**
 * API endpoint for getting stats.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Register stats route
add_action('rest_api_init', function () {
    register_rest_route('umh/v1', '/stats', array(
        'methods' => 'GET',
        'callback' => 'umh_get_stats',
        'permission_callback' => function() {
            // Gunakan helper permission check jika tersedia
            if (function_exists('umh_check_api_permission')) {
                return umh_check_api_permission(null, ['owner', 'admin_staff', 'finance_staff', 'marketing_staff']);
            }
            return current_user_can('read');
        },
    ));
});

/**
 * Get stats callback.
 *
 * @return WP_REST_Response
 */
function umh_get_stats() {
    global $wpdb;
    
    // Prefix tabel
    $prefix = $wpdb->prefix . 'umh_';
    
    // Initialize default values
    $total_jamaah = 0;
    $available_packages = 0;
    $total_pending_payments = 0;
    $total_revenue = 0;

    // 1. Total Jamaah
    $table_jamaah = $prefix . 'jamaah';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_jamaah'") == $table_jamaah) {
        $total_jamaah = (int) $wpdb->get_var("SELECT COUNT(id) FROM $table_jamaah");
    }

    // 2. Total Paket Tersedia
    $table_packages = $prefix . 'packages';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_packages'") == $table_packages) {
        $available_packages = (int) $wpdb->get_var("SELECT COUNT(id) FROM $table_packages WHERE status = 'available'");
    }

    // 3. Total Piutang (Pending Payments)
    // Logika: Total harga semua jamaah dikurangi total yang sudah dibayar
    // Ini estimasi kasar. Untuk akurasi, perlu query join yang lebih kompleks.
    // Untuk sekarang kita gunakan query sederhana pada tabel jamaah.
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_jamaah'") == $table_jamaah) {
        $total_price_all = (float) $wpdb->get_var("SELECT SUM(total_price) FROM $table_jamaah");
        $amount_paid_all = (float) $wpdb->get_var("SELECT SUM(amount_paid) FROM $table_jamaah");
        $total_pending_payments = $total_price_all - $amount_paid_all;
    }

    // 4. Total Revenue (Dari tabel finance jika ada)
    $table_finance = $prefix . 'finance';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_finance'") == $table_finance) {
        $total_revenue = (float) $wpdb->get_var("SELECT SUM(amount) FROM $table_finance WHERE type = 'income'");
    }

    return new WP_REST_Response(array(
        'total_jamaah' => $total_jamaah,
        'available_packages' => $available_packages,
        'total_pending_payments' => $total_pending_payments, // Untuk StatCard 'Total Piutang'
        'total_revenue' => $total_revenue,
    ), 200);
}