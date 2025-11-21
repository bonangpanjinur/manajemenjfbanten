<?php
if (!defined('ABSPATH')) exit;

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_API_Branches extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_branches');
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/branches', [
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

        register_rest_route('umh/v1', '/branches/(?P<id>\d+)', [
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

    public function prepare_item_for_database($request) {
        // Validasi Kode Cabang Unik
        if ($request->get_method() === 'POST') {
            global $wpdb;
            $code = sanitize_text_field($request['code']);
            $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE code = %s", $code));
            if ($exists) {
                return new WP_Error('duplicate_code', 'Kode cabang sudah digunakan', ['status' => 400]);
            }
        }

        return [
            'code' => sanitize_text_field($request['code']),
            'name' => sanitize_text_field($request['name']),
            'city' => sanitize_text_field($request['city']),
            'address' => sanitize_textarea_field($request['address']),
            'head_of_branch' => sanitize_text_field($request['head_of_branch']),
            'phone' => sanitize_text_field($request['phone']),
            'status' => sanitize_text_field($request['status'])
        ];
    }
}