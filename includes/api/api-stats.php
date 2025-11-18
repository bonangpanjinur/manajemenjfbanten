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
        'permission_callback' => 'umh_api_permission_check',
    ));
});

/**
 * Get stats callback.
 *
 * @return WP_REST_Response
 */
function umh_get_stats() {
    global $wpdb;
    $tables = umh_get_db_tables();

    // Initialize with default values
    $total_jamaah = 0;
    $total_packages = 0;
    $total_finance_raw = 0;
    $total_leads = 0;

    // --- PERBAIKAN DIMULAI DI SINI ---
    // Logika yang sebelumnya di-comment, sekarang diaktifkan
    // dan disempurnakan dengan pengecekan tabel

    // Get total jamaah
    if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $tables['jamaah'] ) ) == $tables['jamaah'] ) {
        $total_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$tables['jamaah']}");
    }

    // Get total packages
    if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $tables['packages'] ) ) == $tables['packages'] ) {
        $total_packages = $wpdb->get_var("SELECT COUNT(*) FROM {$tables['packages']}");
    }

    // Get total finance
    if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $tables['finance'] ) ) == $tables['finance'] ) {
        $total_finance_raw = $wpdb->get_var("SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) FROM {$tables['finance']}");
    }

    // Get total leads
    if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $tables['marketing'] ) ) == $tables['marketing'] ) {
        $total_leads = $wpdb->get_var("SELECT COUNT(*) FROM {$tables['marketing']}");
    }

    // Format finance value
    $total_finance_formatted = 'Rp ' . number_format($total_finance_raw ? $total_finance_raw : 0, 0, ',', '.');
    
    // --- PERBAIKAN SELESAI ---

    return new WP_REST_Response(array(
        'total_jamaah' => (int) $total_jamaah, // Kirim sebagai integer
        'total_packages' => (int) $total_packages, // Kirim sebagai integer
        'total_finance' => $total_finance_formatted, // Kirim sebagai string yang sudah diformat
        'total_leads' => 999, // <--- UBAH SEMENTARA UNTUK TES
    ), 200);
}