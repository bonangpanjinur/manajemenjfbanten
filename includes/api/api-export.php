<?php
// File: includes/api/api-export.php
// Mengelola endpoint untuk ekspor data (misal: CSV).

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_action('rest_api_init', 'umh_register_export_routes');

function umh_register_export_routes() {
    $namespace = 'umh/v1'; // Namespace baru yang konsisten

    // PERBAIKAN: Tentukan izin (baca-saja)
    // --- PERBAIKAN: Menyimpan array role, bukan memanggil fungsi ---
    $read_permissions_roles = ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'];
    // --- AKHIR PERBAIKAN ---

    // Endpoint untuk ekspor data jemaah
    register_rest_route($namespace, '/export/jamaah', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_export_jamaah_csv',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($read_permissions_roles) {
                return umh_check_api_permission($request, $read_permissions_roles);
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);
}

// Callback: Export Jamaah as CSV
function umh_export_jamaah_csv(WP_REST_Request $request) {
    global $wpdb;
    
    // Menggunakan tabel UMH yang baru
    $jamaah_table = $wpdb->prefix . 'umh_jamaah';
    $packages_table = $wpdb->prefix . 'umh_packages';
    
    $package_id = $request->get_param('package_id');

    // --- PERBAIKAN: Menggunakan 'name' dari tabel paket baru ---
    $query = "
        SELECT j.*, p.name as package_name 
        FROM $jamaah_table j 
        LEFT JOIN $packages_table p ON j.package_id = p.id
        WHERE 1=1
    ";
    // --- AKHIR PERBAIKAN ---

    if (!empty($package_id)) {
        $query .= $wpdb->prepare(" AND j.package_id = %d", $package_id);
    }
    
    $data = $wpdb->get_results($query, ARRAY_A);

    if ($data === false) {
        return new WP_Error('db_error', __('Database error.', 'umh'), ['status' => 500]);
    }

    if (empty($data)) {
        // --- PERBAIKAN: Mengembalikan response error, jangan 'exit' ---
        return new WP_Error('not_found', __('No data to export.', 'umh'), ['status' => 404]);
    }

    // Generate CSV
    $filename = 'export_jamaah_' . date('Y-m-d') . '.csv';
    
    // --- PERBAIKAN: Menggunakan WP_REST_Response untuk mengirim file ---
    $response = new WP_REST_Response();
    
    // Siapkan output CSV ke string
    $output = fopen('php://temp', 'w');
    
    // Header
    fputcsv($output, array_keys($data[0]));
    
    // Data
    foreach ($data as $row) {
        fputcsv($output, $row);
    }
    
    rewind($output);
    $csv_data = stream_get_contents($output);
    fclose($output);

    $response->set_data($csv_data);
    $response->set_status(200);
    $response->header('Content-Type', 'text/csv');
    $response->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    
    return $response;
    // --- AKHIR PERBAIKAN ---
}