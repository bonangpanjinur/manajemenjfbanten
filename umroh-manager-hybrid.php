<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Description: Plugin kustom untuk manajemen Umroh (Headless + React).
 * Version: 1.1
 * Author: Bonang Panji Nur
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('UMH_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// Includes
require_once(UMH_PLUGIN_PATH . 'includes/db-schema.php');
require_once(UMH_PLUGIN_PATH . 'includes/class-umh-crud-controller.php');
require_once(UMH_PLUGIN_PATH . 'includes/utils.php');

// Aktivasi Plugin: Buat tabel
register_activation_hook(__FILE__, 'umh_create_tables');

// Admin Menu
require_once(UMH_PLUGIN_PATH . 'admin/dashboard-react.php');
require_once(UMH_PLUGIN_PATH . 'admin/settings-page.php');

// Include file-file API
require_once(UMH_PLUGIN_PATH . 'includes/api/api-jamaah.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-packages.php');
require_once(UMH_PLUGIN_PATH . 'includes/api/api-finance.php');
require_entry('includes/api/api-categories.php');
require_entry('includes/api/api-departures.php');
require_entry('includes/api/api-export.php');
require_entry('includes/api/api-flights.php');
require_entry('includes/api/api-hotels.php');
require_entry('includes/api/api-hr.php');
require_entry('includes/api/api-jamaah-payments.php');
require_entry('includes/api/api-logs.php');
require_entry('includes/api/api-marketing.php');
require_entry('includes/api/api-print.php');
require_entry('includes/api/api-roles.php');
require_entry('includes/api/api-stats.php');
require_entry('includes/api/api-tasks.php');
require_entry('includes/api/api-uploads.php');
require_entry('includes/api/api-users.php');


/**
 * Helper untuk mendaftarkan rute CRUD generik.
 */
function register_crud_routes($controller, $base_slug, $base_permission) {
    register_rest_route('umh/v1', '/' . $base_slug, [
        'methods' => WP_REST_Server::READABLE,
        'callback' => [$controller, 'get_items'],
        'permission_callback' => function () use ($controller, $base_permission) {
            return umh_check_permission(array_merge(['administrator', 'super_admin', 'owner'], $base_permission, $controller->permissions['get_items']));
        },
    ]);
    
    register_rest_route('umh/v1', '/' . $base_slug, [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => [$controller, 'create_item'],
        'permission_callback' => function () use ($controller, $base_permission) {
            return umh_check_permission(array_merge(['administrator', 'super_admin', 'owner'], $base_permission, $controller->permissions['create_item']));
        },
        'args' => $controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
    ]);
    
    register_rest_route('umh/v1', '/' . $base_slug . '/(?P<id>\d+)', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => [$controller, 'get_item'],
        'permission_callback' => function () use ($controller, $base_permission) {
            return umh_check_permission(array_merge(['administrator', 'super_admin', 'owner'], $base_permission, $controller->permissions['get_item']));
        },
    ]);
    
    register_rest_route('umh/v1', '/' . $base_slug . '/(?P<id>\d+)', [
        'methods' => WP_REST_Server::EDITABLE,
        'callback' => [$controller, 'update_item'],
        'permission_callback' => function () use ($controller, $base_permission) {
            return umh_check_permission(array_merge(['administrator', 'super_admin', 'owner'], $base_permission, $controller->permissions['update_item']));
        },
        'args' => $controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
    ]);
    
    register_rest_route('umh/v1', '/' . $base_slug . '/(?P<id>\d+)', [
        'methods' => WP_REST_Server::DELETABLE,
        'callback' => [$controller, 'delete_item'],
        'permission_callback' => function () use ($controller, $base_permission) {
            return umh_check_permission(array_merge(['administrator', 'super_admin', 'owner'], $base_permission, $controller->permissions['delete_item']));
        },
    ]);
}


/**
 * Registrasi semua endpoint REST API kustom.
 */
function umh_register_api_endpoints() {
    global $wpdb;
    $table_prefix = $wpdb->prefix . 'umh_';

    // Izin dasar untuk setiap modul
    $admin_staff_permission = ['admin_staff'];
    $finance_permission = ['finance_staff', 'admin_staff'];
    $marketing_permission = ['marketing_staff', 'admin_staff'];
    $hr_permission = ['hr_staff', 'admin_staff'];

    // 1. Jamaah
    $jamaah_controller = new UMH_CRUD_Controller($table_prefix . 'jamaah', 'jamaah');
    register_crud_routes($jamaah_controller, 'jamaah', $admin_staff_permission);

    // 2. Paket
    $package_controller = new UMH_CRUD_Controller($table_prefix . 'packages', 'package');
    register_crud_routes($package_controller, 'packages', $marketing_permission);

    // 3. Finance
    $finance_controller = new UMH_CRUD_Controller($table_prefix . 'finance', 'finance');
    register_crud_routes($finance_controller, 'finance', $finance_permission);

    // 4. Kategori Finance
    $categories_controller = new UMH_CRUD_Controller($table_prefix . 'categories', 'category');
    register_crud_routes($categories_controller, 'categories', $finance_permission);
    
    // 5. Akun Keuangan (Finance Accounts)
    $accounts_controller = new UMH_CRUD_Controller($table_prefix . 'finance_accounts', 'account');
    register_crud_routes($accounts_controller, 'accounts', $finance_permission);

    // 6. Marketing
    $marketing_controller = new UMH_CRUD_Controller($table_prefix . 'marketing', 'marketing');
    register_crud_routes($marketing_controller, 'marketing', $marketing_permission);
    
    // 7. HR
    $hr_controller = new UMH_CRUD_Controller($table_prefix . 'hr', 'hr');
    register_crud_routes($hr_controller, 'hr', $hr_permission);

    // 8. Users (Headless)
    $users_controller = new UMH_CRUD_Controller($table_prefix . 'users', 'user');
    register_crud_routes($users_controller, 'users', $admin_staff_permission);

    // 9. Roles
    $roles_controller = new UMH_CRUD_Controller($table_prefix . 'roles', 'role');
    register_crud_routes($roles_controller, 'roles', $admin_staff_permission);
    
    // 10. Logs
    $logs_controller = new UMH_CRUD_Controller($table_prefix . 'logs', 'log');
    register_crud_routes($logs_controller, 'logs', $admin_staff_permission);

    // 11. Tasks
    $tasks_controller = new UMH_CRUD_Controller($table_prefix . 'tasks', 'task');
    register_crud_routes($tasks_controller, 'tasks', $admin_staff_permission);

    // --- PENAMBAHAN: Endpoint Sub Agen ---
    // 12. Sub Agen
    $sub_agents_controller = new UMH_CRUD_Controller($table_prefix . 'sub_agents', 'sub_agent');
    register_crud_routes($sub_agents_controller, 'sub_agents', $marketing_permission);
    // --- AKHIR PENAMBAHAN ---
    
    // Registrasi endpoint kustom (non-CRUD)
    umh_register_custom_jamaah_routes();
    umh_register_custom_package_routes();
    umh_register_custom_finance_routes();
    // ... daftarkan rute kustom lainnya ...
}
add_action('rest_api_init', 'umh_register_api_endpoints');

// Helper 'require_entry'
function require_entry($path) {
    $full_path = UMH_PLUGIN_PATH . $path;
    if (file_exists($full_path)) {
        require_once($full_path);
    } else {
        // Handle error: file not found
    }
}