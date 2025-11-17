<?php
// Lokasi: includes/api/api-roles.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Register API routes for Roles (Divisi).
 *
 * @param string $namespace The API namespace.
 */
function umh_register_roles_api_routes($namespace) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_roles';
    $item_name = 'role'; // 'role'

    // Tentukan izin
    // Hanya Owner dan Admin Staff yang bisa mengelola roles
    $permissions = array(
        'get_items' => ['owner', 'admin_staff', 'hr_staff', 'finance_staff', 'marketing_staff'], // Semua staff bisa lihat
        'create_item' => ['owner', 'admin_staff'],
        'get_item' => ['owner', 'admin_staff', 'hr_staff'],
        'update_item' => ['owner', 'admin_staff'],
        'delete_item' => ['owner', 'admin_staff'],
    );

    // Buat instance CRUD controller
    $crud_controller = new UMH_CRUD_Controller($table_name, $item_name, $permissions);

    // Register routes
    register_rest_route($namespace, "/{$item_name}s", array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_items'),
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['get_items']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($crud_controller, 'create_item'),
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['create_item']);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
        ),
    ));

    register_rest_route($namespace, "/{$item_name}s/(?P<id>\d+)", array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_item'),
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['get_item']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
        array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array($crud_controller, 'update_item'),
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['update_item']);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
        ),
        array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($crud_controller, 'delete_item'),
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function ($request) use ($permissions) {
                return umh_check_api_permission($request, $permissions['delete_item']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
    ));
}

// Hook pendaftaran routes
add_action('rest_api_init', function () {
    umh_register_roles_api_routes('umh/v1');
});