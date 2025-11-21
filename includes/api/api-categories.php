<?php
if (!defined('ABSPATH')) exit;

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_API_Categories extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_categories');
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/categories', [
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

        register_rest_route('umh/v1', '/categories/(?P<id>\d+)', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
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

    // Override get_items untuk support filter parent
    public function get_items($request) {
        global $wpdb;
        $params = $request->get_params();
        $where = "WHERE 1=1";
        $args = [];

        // Filter berdasarkan parent_id (0 untuk utama, >0 untuk sub)
        if (isset($params['parent_id'])) {
            $where .= " AND parent_id = %d";
            $args[] = $params['parent_id'];
        }
        
        // Jika ingin mengambil semua data flat untuk diproses di frontend
        if (isset($params['all']) && $params['all'] == 'true') {
             // No additional filter
        }

        if (isset($params['search'])) {
            $where .= " AND name LIKE %s";
            $args[] = '%' . $wpdb->esc_like($params['search']) . '%';
        }

        $query = "SELECT * FROM {$this->table_name} $where ORDER BY parent_id ASC, name ASC";
        
        if (!empty($args)) {
            $items = $wpdb->get_results($wpdb->prepare($query, $args));
        } else {
            $items = $wpdb->get_results($query);
        }

        return rest_ensure_response($items);
    }

    public function prepare_item_for_database($request) {
        $data = [
            'name' => sanitize_text_field($request['name']),
            'parent_id' => isset($request['parent_id']) ? intval($request['parent_id']) : 0, // Default ke 0 (Utama)
            'description' => sanitize_textarea_field($request['description'] ?? ''),
        ];

        // Auto generate slug jika tidak ada
        if (isset($request['slug']) && !empty($request['slug'])) {
            $data['slug'] = sanitize_title($request['slug']);
        } else {
            $data['slug'] = sanitize_title($data['name']);
        }

        return $data;
    }
}