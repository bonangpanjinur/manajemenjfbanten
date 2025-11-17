<?php
// File: includes/api/api-tasks.php
// Menggunakan CRUD Controller untuk mengelola Tugas.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Register API routes for Tasks.
 */
function umh_register_tasks_api_routes() {
    $namespace = 'umh/v1';

    // 1. Definisikan Skema Data (cocokkan dengan db-schema.php)
    $tasks_schema = [
        'assigned_to_user_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
        'created_by_user_id'  => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'], // Akan diisi otomatis
        'jamaah_id'           => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
        'title'               => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'description'         => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
        'due_date'            => ['type' => 'string', 'format' => 'date', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
        'status'              => ['type' => 'string', 'required' => false, 'default' => 'pending', 'enum' => ['pending', 'in_progress', 'completed']],
        'priority'            => ['type' => 'string', 'required' => false, 'default' => 'medium', 'enum' => ['low', 'medium', 'high']],
    ];

    // 2. Definisikan Izin (Siapa boleh ngapain?)
    $tasks_permissions = [
        // Semua staf bisa melihat tugas
        'get_items'    => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
        'get_item'     => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
        // Hanya owner dan admin_staff yang bisa membuat tugas baru
        'create_item'  => ['owner', 'admin_staff'],
        // Siapapun bisa update tugas (misal: update status)
        'update_item'  => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
        // Hanya owner yang bisa menghapus
        'delete_item'  => ['owner'],
    ];

    // 3. Inisialisasi Controller
    $table_name = $GLOBALS['wpdb']->prefix . 'umh_tasks';
    $item_name = 'task'; // Endpoint akan menjadi /tasks

    $crud_controller = new UMH_CRUD_Controller($table_name, $item_name, $tasks_permissions);

    // 4. Register routes
    register_rest_route($namespace, "/{$item_name}s", array( // Menjadi /tasks
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_items'),
            'permission_callback' => function ($request) use ($tasks_permissions) {
                return umh_check_api_permission($request, $tasks_permissions['get_items']);
            },
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($crud_controller, 'create_item'),
            'permission_callback' => function ($request) use ($tasks_permissions) {
                return umh_check_api_permission($request, $tasks_permissions['create_item']);
            },
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
        ),
    ));

    register_rest_route($namespace, "/{$item_name}s/(?P<id>\d+)", array( // Menjadi /tasks/(id)
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($crud_controller, 'get_item'),
            'permission_callback' => function ($request) use ($tasks_permissions) {
                return umh_check_api_permission($request, $tasks_permissions['get_item']);
            },
        ),
        array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array($crud_controller, 'update_item'),
            'permission_callback' => function ($request) use ($tasks_permissions) {
                return umh_check_api_permission($request, $tasks_permissions['update_item']);
            },
            'args' => $crud_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
        ),
        array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($crud_controller, 'delete_item'),
            'permission_callback' => function ($request) use ($tasks_permissions) {
                return umh_check_api_permission($request, $tasks_permissions['delete_item']);
            },
        ),
    ));
}

// Hook pendaftaran routes
add_action('rest_api_init', 'umh_register_tasks_api_routes');