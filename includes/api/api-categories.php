<?php
// Lokasi: includes/api/api-categories.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Register API routes for Finance Categories.
 *
 * @param string $namespace The API namespace.
 */
function umh_register_categories_api_routes($namespace) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_categories';
    $item_name = 'category'; // 'category'

    // --- PERBAIKAN (Kategori 3, Poin 1): Tentukan Izin ---
    // Kategori dikelola oleh Finance, Admin, dan Owner
    $permissions = array(
        'get_items' => ['owner', 'admin_staff', 'finance_staff'],
        'create_item' => ['owner', 'admin_staff', 'finance_staff'],
        'get_item' => ['owner', 'admin_staff', 'finance_staff'],
        'update_item' => ['owner', 'admin_staff', 'finance_staff'],
        'delete_item' => ['owner', 'admin_staff', 'finance_staff'],
    );
    // --- AKHIR PERBAIKAN ---

    // --- PERBAIKAN (Kategori 3, Poin 1): Gunakan UMH_CRUD_Controller ---
    // Buat instance CRUD controller
    $crud_controller = new UMH_CRUD_Controller($table_name, $item_name, $permissions);

    // Register routes
    register_rest_route($namespace, "/{$item_name}s", array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_items'),
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['get_items']);
            },
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($crud_controller, 'create_item'),
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['create_item']);
            },
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
        ),
    ));

    register_rest_route($namespace, "/{$item_name}s/(?P<id>\d+)", array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_item'),
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['get_item']);
            },
        ),
        array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array($crud_controller, 'update_item'),
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['update_item']);
            },
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
        ),
        array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($crud_controller, 'delete_item'),
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['delete_item']);
            },
        ),
    ));
    // --- AKHIR PERBAIKAN ---
}

// Hook pendaftaran routes
add_action('rest_api_init', function () {
    umh_register_categories_api_routes('umh/v1');
});