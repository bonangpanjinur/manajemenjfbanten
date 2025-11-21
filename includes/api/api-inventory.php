<?php
if (!defined('ABSPATH')) exit;

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_API_Inventory extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_inventory');
    }

    public function register_routes() {
        // 1. Master Inventory Routes
        register_rest_route('umh/v1', '/inventory', [
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

        register_rest_route('umh/v1', '/inventory/(?P<id>\d+)', [
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

        // 2. Distribution Routes (Barang diambil Jamaah)
        register_rest_route('umh/v1', '/inventory/distribute', [
            [
                'methods' => 'GET', // Get history for specific jamaah
                'callback' => [$this, 'get_distribution_history'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods' => 'POST', // Jamaah ambil barang
                'callback' => [$this, 'record_distribution'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        ]);
    }

    // --- DISTRIBUSI METHODS ---

    public function get_distribution_history($request) {
        global $wpdb;
        $jamaah_id = $request->get_param('jamaah_id');

        if (!$jamaah_id) {
            return new WP_Error('missing_param', 'Jamaah ID required', ['status' => 400]);
        }

        $query = "
            SELECT d.*, i.name as item_name, i.unit 
            FROM {$wpdb->prefix}umh_jamaah_equipment d
            JOIN {$this->table_name} i ON d.inventory_id = i.id
            WHERE d.jamaah_id = %d
            ORDER BY d.taken_date DESC
        ";

        $results = $wpdb->get_results($wpdb->prepare($query, $jamaah_id));
        return rest_ensure_response($results);
    }

    public function record_distribution($request) {
        global $wpdb;
        
        $jamaah_id = intval($request['jamaah_id']);
        $items = $request['items']; // Array of { inventory_id, qty }

        if (empty($items) || !is_array($items)) {
            return new WP_Error('invalid_data', 'Items data required', ['status' => 400]);
        }

        $wpdb->query('START TRANSACTION');

        try {
            foreach ($items as $item) {
                $inv_id = intval($item['inventory_id']);
                $qty = intval($item['qty']);

                // 1. Cek Stok
                $current_stock = $wpdb->get_var($wpdb->prepare(
                    "SELECT stock_quantity FROM {$this->table_name} WHERE id = %d", $inv_id
                ));

                if ($current_stock < $qty) {
                    throw new Exception("Stok tidak cukup untuk item ID: $inv_id");
                }

                // 2. Kurangi Stok
                $wpdb->query($wpdb->prepare(
                    "UPDATE {$this->table_name} SET stock_quantity = stock_quantity - %d WHERE id = %d",
                    $qty, $inv_id
                ));

                // 3. Catat Distribusi
                $wpdb->insert(
                    "{$wpdb->prefix}umh_jamaah_equipment",
                    [
                        'jamaah_id' => $jamaah_id,
                        'inventory_id' => $inv_id,
                        'qty' => $qty,
                        'status' => 'taken',
                        'taken_date' => current_time('mysql'),
                        'notes' => sanitize_textarea_field($request['notes'] ?? '')
                    ]
                );
            }

            $wpdb->query('COMMIT');
            return rest_ensure_response(['success' => true, 'message' => 'Perlengkapan berhasil diserahkan']);

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('db_error', $e->getMessage(), ['status' => 500]);
        }
    }

    public function prepare_item_for_database($request) {
        return [
            'name' => sanitize_text_field($request['name']),
            'stock_quantity' => intval($request['stock_quantity']),
            'unit' => sanitize_text_field($request['unit']),
            'type' => sanitize_text_field($request['type']),
            'description' => sanitize_textarea_field($request['description'])
        ];
    }
}