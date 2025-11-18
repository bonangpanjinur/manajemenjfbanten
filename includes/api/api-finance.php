<?php
// File: includes/api/api-finance.php
// Menggunakan CRUD Controller untuk mengelola Keuangan.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Register API routes for Finance.
 */
function umh_register_finance_api_routes() {
    $namespace = 'umh/v1';

    // === 1. Transaksi Keuangan Utama ===
    $finance_schema = [
        'transaction_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
        'description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
        // PERBAIKAN: Mengganti nama 'transaction_type' menjadi 'type' agar cocok dengan DB
        'type' => ['type' => 'string', 'required' => true, 'enum' => ['income', 'expense']],
        'amount' => ['type' => 'number', 'required' => true],
        'category_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
        'account_id' => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
        'jamaah_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
        'user_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'], // Diisi oleh controller
        'status' => ['type' => 'string', 'required' => false, 'default' => 'completed', 'enum' => ['pending', 'completed']],
    ];

    $finance_permissions = [
        'get_items'    => ['owner', 'admin_staff', 'finance_staff'],
        'get_item'     => ['owner', 'admin_staff', 'finance_staff'],
        'create_item'  => ['owner', 'admin_staff', 'finance_staff'],
        'update_item'  => ['owner', 'admin_staff', 'finance_staff'],
        'delete_item'  => ['owner', 'admin_staff', 'finance_staff'],
    ];

    $finance_table_name = $GLOBALS['wpdb']->prefix . 'umh_finance';
    $finance_item_name = 'finance'; // Endpoint: /finance

    $finance_controller = new UMH_CRUD_Controller($finance_table_name, $finance_item_name, $finance_permissions);

    // Register routes for /finance
    register_rest_route($namespace, "/{$finance_item_name}", array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($finance_controller, 'get_items'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($finance_permissions) {
                return umh_check_api_permission($request, $finance_permissions['get_items']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($finance_controller, 'create_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($finance_permissions) {
                return umh_check_api_permission($request, $finance_permissions['create_item']);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => $finance_controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
        ),
    ));

    register_rest_route($namespace, "/{$finance_item_name}/(?P<id>\d+)", array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($finance_controller, 'get_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($finance_permissions) {
                return umh_check_api_permission($request, $finance_permissions['get_item']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
        array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array($finance_controller, 'update_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($finance_permissions) {
                return umh_check_api_permission($request, $finance_permissions['update_item']);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => $finance_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
        ),
        array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($finance_controller, 'delete_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($finance_permissions) {
                return umh_check_api_permission($request, $finance_permissions['delete_item']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
    ));


    // === 2. Akun Keuangan (Petty Cash, dll) ===
    $accounts_schema = [
        'name' => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    ];
    
    $accounts_permissions = [
        'get_items'    => ['owner', 'admin_staff', 'finance_staff'], // Staf boleh lihat
        'get_item'     => ['owner', 'admin_staff', 'finance_staff'],
        'create_item'  => ['owner', 'admin_staff'], // Diubah agar admin bisa buat
        'update_item'  => ['owner', 'admin_staff'],
        'delete_item'  => ['owner'],
    ];

    $accounts_table_name = $GLOBALS['wpdb']->prefix . 'umh_finance_accounts';
    // PERBAIKAN: item_name harus 'finance_account' agar endpoint jadi /finance_accounts
    $accounts_item_name = 'finance_account'; // Endpoint: /finance_accounts

    $accounts_controller = new UMH_CRUD_Controller($accounts_table_name, $accounts_item_name, $accounts_permissions);
    
    // Register routes for /finance_accounts
    register_rest_route($namespace, "/{$accounts_item_name}s", array( // Menjadi /finance_accounts
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($accounts_controller, 'get_items'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($accounts_permissions) {
                return umh_check_api_permission($request, $accounts_permissions['get_items']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($accounts_controller, 'create_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($accounts_permissions) {
                return umh_check_api_permission($request, $accounts_permissions['create_item']);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => $accounts_controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
        ),
    ));
    
    register_rest_route($namespace, "/{$accounts_item_name}s/(?P<id>\d+)", array( // Menjadi /finance_accounts/(id)
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($accounts_controller, 'get_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($accounts_permissions) {
                return umh_check_api_permission($request, $accounts_permissions['get_item']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
        array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array($accounts_controller, 'update_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($accounts_permissions) {
                return umh_check_api_permission($request, $accounts_permissions['update_item']);
            },
            // --- AKHIR PERBAIKAN ---
            'args' => $accounts_controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
        ),
        array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($accounts_controller, 'delete_item'),
            // --- PERBAIKAN (Kategori 1): Menggunakan anonymous function ---
            'permission_callback' => function ($request) use ($accounts_permissions) {
                return umh_check_api_permission($request, $accounts_permissions['delete_item']);
            },
            // --- AKHIR PERBAIKAN ---
        ),
    ));
}

// Hook pendaftaran routes
add_action('rest_api_init', 'umh_register_finance_api_routes');