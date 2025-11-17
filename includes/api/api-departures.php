<?php
// File: includes/api/api-departures.php
// PERBAIKAN: Menggunakan CRUD Controller untuk Keberangkatan.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Register API routes for Departures.
 */
function umh_register_departures_api_routes() {
    $namespace = 'umh/v1';

    // 1. Definisikan Skema Data
    $departures_schema = [
        'package_id'     => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
        'departure_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
        'status'         => ['type' => 'string', 'required' => false, 'default' => 'scheduled', 'enum' => ['scheduled', 'departed', 'completed', 'cancelled']],
        // Tambahkan field lain dari tabel 'umh_departures' jika ada
    ];

    // 2. Definisikan Izin
    $departures_permissions = [
        'get_items'    => ['owner', 'admin_staff', 'marketing_staff'],
        'get_item'     => ['owner', 'admin_staff', 'marketing_staff'],
        'create_item'  => ['owner', 'admin_staff'],
        'update_item'  => ['owner', 'admin_staff'],
        'delete_item'  => ['owner'],
    ];

    // 3. Inisialisasi Controller
    $table_name = $GLOBALS['wpdb']->prefix . 'umh_departures';
    $item_name = 'departure'; // Endpoint akan menjadi /departures

    $crud_controller = new UMH_CRUD_Controller($table_name, $item_name, $departures_permissions);
    
    // 4. Register routes
    register_rest_route($namespace, "/{$item_name}s", array( // Menjadi /departures
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_items'),
            'permission_callback' => function ($request) use ($departures_permissions) {
                return umh_check_api_permission($request, $departures_permissions['get_items']);
            },
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($crud_controller, 'create_item'),
            'permission_callback' => function ($request) use ($departures_permissions) {
                return umh_check_api_permission($request, $departures_permissions['create_item']);
            },
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
        ),
    ));

    register_rest_route($namespace, "/{$item_name}s/(?P<id>\d+)", array( // Menjadi /departures/(id)
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_item'),
            'permission_callback' => function ($request) use ($departures_permissions) {
                return umh_check_api_permission($request, $departures_permissions['get_item']);
            },
        ),
        array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array($crud_controller, 'update_item'),
            'permission_callback' => function ($request) use ($departures_permissions) {
                return umh_check_api_permission($request, $departures_permissions['update_item']);
            },
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
        ),
        array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($crud_controller, 'delete_item'),
            'permission_callback' => function ($request) use ($departures_permissions) {
                return umh_check_api_permission($request, $departures_permissions['delete_item']);
            },
        ),
    ));
}

// Hook pendaftaran routes
add_action('rest_api_init', 'umh_register_departures_api_routes');