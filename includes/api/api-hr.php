<?php
if (!defined('ABSPATH')) exit;

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_API_HR extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_employees');
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/hr/employees', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_items'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'create_item'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        ]);

        register_rest_route('umh/v1', '/hr/employees/(?P<id>\d+)', [
            [
                'methods' => 'PUT',
                'callback' => [$this, 'update_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods' => 'DELETE',
                'callback' => [$this, 'delete_item'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        ]);
    }

    // Override get_items untuk decode JSON permission
    public function get_items($request) {
        global $wpdb;
        $items = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY name ASC");

        foreach ($items as $item) {
            if (!empty($item->access_permissions)) {
                $item->access_permissions = json_decode($item->access_permissions);
            } else {
                $item->access_permissions = [];
            }
        }

        return rest_ensure_response($items);
    }

    public function prepare_item_for_database($request) {
        $data = [
            'name' => sanitize_text_field($request['name']),
            'position' => sanitize_text_field($request['position']),
            'phone' => sanitize_text_field($request['phone']),
            'email' => sanitize_email($request['email']),
            'salary' => floatval($request['salary']),
            'status' => sanitize_text_field($request['status']),
        ];

        // Handle Permissions Array -> JSON String
        if (isset($request['access_permissions'])) {
            $permissions = $request['access_permissions'];
            if (is_array($permissions)) {
                $data['access_permissions'] = json_encode($permissions);
            } else {
                $data['access_permissions'] = json_encode([]); // Default empty array
            }
        }

        return $data;
    }
}