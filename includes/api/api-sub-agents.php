<?php
// Lokasi: includes/api/api-sub-agents.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Register API routes for Sub Agents.
 */
function umh_register_sub_agents_api_routes() {
    $namespace = 'umh/v1';
    $table_name = $GLOBALS['wpdb']->prefix . 'umh_sub_agents';
    $item_name = 'sub_agents'; // Endpoint: /umh/v1/sub_agents

    $permissions = [
        'get_items' => ['owner', 'admin_staff', 'marketing_staff', 'finance_staff'],
        'create_item' => ['owner', 'admin_staff', 'marketing_staff'],
        'get_item' => ['owner', 'admin_staff', 'marketing_staff'],
        'update_item' => ['owner', 'admin_staff', 'marketing_staff'],
        'delete_item' => ['owner', 'admin_staff'],
    ];

    $crud_controller = new UMH_CRUD_Controller($table_name, $item_name, $permissions);

    // Register routes
    register_rest_route($namespace, "/{$item_name}", array(
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

    register_rest_route($namespace, "/{$item_name}/(?P<id>\d+)", array(
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

add_action('rest_api_init', 'umh_register_sub_agents_api_routes');