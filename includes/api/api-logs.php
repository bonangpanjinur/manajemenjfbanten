<?php
// Lokasi: includes/api/api-logs.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// <!-- PERBAIKAN (Kategori 3): Hapus fungsi ini -->
// Fungsi umh_create_log_entry() telah dipindahkan ke includes/utils.php
// agar bisa diakses secara global oleh UMH_CRUD_Controller.
// Fungsi ini tidak perlu didefinisikan ulang di sini.
/*
function umh_create_log_entry($user_id, $action_type, $related_table, $related_id, $description, $details_json = '') {
    // ... (kode yang dipindahkan) ...
}
*/
// <!-- AKHIR PERBAIKAN -->


/**
 * Register log API routes.
 *
 * @param string $namespace The API namespace.
 */
function umh_register_logs_api_routes($namespace) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logs';
    $users_table = $wpdb->prefix . 'users';

    // Izin: Hanya owner dan admin staff yang bisa melihat logs
    $permissions = ['owner', 'admin_staff'];

    register_rest_route($namespace, '/logs', array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => function (WP_REST_Request $request) use ($table_name, $users_table) {
                global $wpdb;
                // Ambil 100 log terbaru
                // Gabungkan dengan tabel users untuk mendapatkan email
                $logs = $wpdb->get_results(
                    "SELECT l.*, u.user_email 
                     FROM $table_name l
                     LEFT JOIN $users_table u ON l.user_id = u.ID
                     ORDER BY l.timestamp DESC 
                     LIMIT 100"
                );
                return new WP_REST_Response($logs, 200);
            },
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions);
            },
            // --- AKHIR PERBAIKAN ---
        ),
    ));
}

// Hook pendaftaran routes
add_action('rest_api_init', function () {
    umh_register_logs_api_routes('umh/v1');
});