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
    
    // --- PERBAIKAN (No Route Found): ---
    // Mengganti $item_name dari 'category' menjadi 'categories'
    // agar route yang terdaftar adalah '/categories' BUKAN '/categorys'
    $item_name = 'categories'; 
    // --- AKHIR PERBAIKAN ---

    // Tentukan Izin
    $permissions = array(
        'get_items' => ['owner', 'admin_staff', 'finance_staff'],
        'create_item' => ['owner', 'admin_staff', 'finance_staff'],
        'get_item' => ['owner', 'admin_staff', 'finance_staff'],
        'update_item' => ['owner', 'admin_staff', 'finance_staff'],
        'delete_item' => ['owner', 'admin_staff', 'finance_staff'],
    );

    // Buat instance CRUD controller
    $crud_controller = new UMH_CRUD_Controller($table_name, $item_name, $permissions);

    // Register routes
    register_rest_route($namespace, "/{$item_name}", array( // Akan menjadi /categories
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

    register_rest_route($namespace, "/{$item_name}/(?P<id>\d+)", array( // Akan menjadi /categories/(id)
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
}

// Hook pendaftaran routes
add_action('rest_api_init', function () {
    umh_register_categories_api_routes('umh/v1');
});