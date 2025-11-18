<?php
// File: includes/api/api-jamaah.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_action('rest_api_init', 'umh_register_jamaah_routes');

function umh_register_jamaah_routes() {
    $namespace = 'umh/v1';
    $read_permissions = ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'];
    $write_permissions = ['owner', 'admin_staff'];
    $delete_permissions = ['owner'];

    register_rest_route($namespace, '/jamaah', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_all_jamaah',
            'permission_callback' => function($request) use ($read_permissions) {
                return umh_check_api_permission($request, $read_permissions);
            },
        ],
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'umh_create_jamaah',
            'permission_callback' => function($request) use ($write_permissions) {
                return umh_check_api_permission($request, $write_permissions);
            },
            'args' => umh_get_jamaah_schema(),
        ],
    ]);

    register_rest_route($namespace, '/jamaah/(?P<id>\d+)', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_jamaah_by_id',
            'permission_callback' => function($request) use ($read_permissions) {
                return umh_check_api_permission($request, $read_permissions);
            },
        ],
        [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => 'umh_update_jamaah',
            'permission_callback' => function($request) use ($write_permissions) {
                return umh_check_api_permission($request, $write_permissions);
            },
            'args' => umh_get_jamaah_schema(true),
        ],
        [
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => 'umh_delete_jamaah',
            'permission_callback' => function($request) use ($delete_permissions) {
                return umh_check_api_permission($request, $delete_permissions);
            },
        ],
    ]);
}

// Skema Validasi (Disingkat, sama seperti sebelumnya tapi pastikan 'amount_paid' tidak wajib saat create)
function umh_get_jamaah_schema($is_update = false) {
    $schema = [
        'package_id' => ['type' => 'integer', 'required' => !$is_update],
        'full_name' => ['type' => 'string', 'required' => !$is_update],
        'id_number' => ['type' => 'string', 'required' => !$is_update],
        // ... field lain opsional ...
        'status' => ['type' => 'string', 'default' => 'pending'],
    ];
    return $schema;
}

// Callback: Get All Jamaah (Optimized)
function umh_get_all_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $package_table = $wpdb->prefix . 'umh_packages';

    // Parameter Query
    $package_id = $request->get_param('package_id');
    $status = $request->get_param('status');
    $search = $request->get_param('search'); // Tambahan parameter search
    $limit = $request->get_param('per_page') ? intval($request->get_param('per_page')) : -1;

    // Base Query dengan JOIN untuk efisiensi (1 query vs N+1)
    $query = "SELECT j.*, p.name as package_name, p.title as package_title 
              FROM $table_name j 
              LEFT JOIN $package_table p ON j.package_id = p.id 
              WHERE 1=1";
    
    $args = [];

    // Filter Logik
    if (!empty($package_id)) {
        $query .= " AND j.package_id = %d";
        $args[] = $package_id;
    }
    if (!empty($status)) {
        $query .= " AND j.status = %s";
        $args[] = $status;
    }
    
    // Search Logic (Server-side)
    if (!empty($search)) {
        $like = '%' . $wpdb->esc_like($search) . '%';
        $query .= " AND (j.full_name LIKE %s OR j.id_number LIKE %s OR j.passport_number LIKE %s)";
        $args[] = $like;
        $args[] = $like;
        $args[] = $like;
    }

    // Order
    $query .= " ORDER BY j.id DESC";
    
    // Limit (Pagination)
    if ($limit > 0) {
        $page = $request->get_param('page') ? intval($request->get_param('page')) : 1;
        $offset = ($page - 1) * $limit;
        $query .= " LIMIT %d OFFSET %d";
        $args[] = $limit;
        $args[] = $offset;
    }

    if (!empty($args)) {
        $query = $wpdb->prepare($query, $args);
    }

    $results = $wpdb->get_results($query, ARRAY_A);
    
    // Hitung Pembayaran (Opsional: Jika ingin akurat dari server)
    // Namun, logic di ApiContext.jsx sudah menangani ini via array payments
    
    return new WP_REST_Response($results, 200);
}

// ... (Callback Create/Update/Delete tetap sama dengan logging yang sudah diperbaiki di utils.php)
function umh_create_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $data = $request->get_json_params();

    // Set defaults
    if (empty($data['total_price']) && isset($data['package_id'])) {
        $pkg = $wpdb->get_row($wpdb->prepare("SELECT price FROM {$wpdb->prefix}umh_packages WHERE id = %d", $data['package_id']));
        $data['total_price'] = $pkg ? $pkg->price : 0;
    }

    // Sanitasi & Persiapan Data
    $insert_data = [
        'package_id' => $data['package_id'],
        'sub_agent_id' => isset($data['sub_agent_id']) ? $data['sub_agent_id'] : null,
        'full_name' => sanitize_text_field($data['full_name']),
        'id_number' => sanitize_text_field($data['id_number']),
        'phone' => sanitize_text_field($data['phone'] ?? ''),
        'email' => sanitize_email($data['email'] ?? ''),
        'address' => sanitize_textarea_field($data['address'] ?? ''),
        'status' => $data['status'] ?? 'pending',
        'total_price' => floatval($data['total_price']),
        'amount_paid' => 0, // Awal 0
        'created_at' => current_time('mysql'),
        'updated_at' => current_time('mysql'),
        // Tambahkan field lain sesuai kebutuhan
    ];

    $result = $wpdb->insert($table_name, $insert_data);

    if ($result === false) {
        return new WP_Error('db_error', 'Gagal membuat jemaah: ' . $wpdb->last_error, ['status' => 500]);
    }
    
    $new_id = $wpdb->insert_id;
    
    // Log
    if (function_exists('umh_create_log_entry')) {
        umh_create_log_entry(umh_get_current_user_context()['id'], 'create', 'jamaah', $new_id, "Jemaah baru: {$insert_data['full_name']}");
    }

    return new WP_REST_Response(['id' => $new_id, 'message' => 'Success'], 201);
}

function umh_update_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $id = (int) $request['id'];
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $data = $request->get_json_params();
    
    unset($data['id'], $data['created_at']); // Protect fields
    $data['updated_at'] = current_time('mysql');

    $wpdb->update($table_name, $data, ['id' => $id]);
    
    return new WP_REST_Response(['id' => $id, 'message' => 'Updated'], 200);
}

function umh_delete_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $id = (int) $request['id'];
    $wpdb->delete($wpdb->prefix . 'umh_jamaah', ['id' => $id]);
    return new WP_REST_Response(['message' => 'Deleted'], 200);
}

function umh_get_jamaah_by_id($request) {
    global $wpdb;
    $id = (int) $request['id'];
    $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_jamaah WHERE id = %d", $id), ARRAY_A);
    if (!$item) return new WP_Error('not_found', 'Jemaah not found', ['status' => 404]);
    return new WP_REST_Response($item, 200);
}