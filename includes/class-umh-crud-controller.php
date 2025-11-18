<?php
// Lokasi: includes/class-umh-crud-controller.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Class UMH_CRUD_Controller
 *
 * Kontroler generik yang disempurnakan untuk menangani operasi CRUD 
 * dengan dukungan Pagination, Search, dan Sorting.
 */
class UMH_CRUD_Controller {
    
    protected $table_name;
    protected $item_name;
    protected $permissions;
    protected $default_permissions = array(
        'get_items'   => ['owner', 'admin_staff'],
        'create_item' => ['owner', 'admin_staff'],
        'get_item'    => ['owner', 'admin_staff'],
        'update_item' => ['owner', 'admin_staff'],
        'delete_item' => ['owner', 'admin_staff'],
    );
    protected $relations;

    public function __construct($table_name, $item_name, $permissions = array(), $relations = array()) {
        $this->table_name = $table_name;
        $this->item_name = $item_name;
        $this->permissions = wp_parse_args($permissions, $this->default_permissions);
        $this->relations = $relations;
    }

    /**
     * Mendapatkan items dengan dukungan Filter, Search, dan Pagination.
     */
    public function get_items($request) {
        global $wpdb;

        // 1. Ambil parameter query
        $page     = $request->get_param('page') ? intval($request->get_param('page')) : 1;
        $per_page = $request->get_param('per_page') ? intval($request->get_param('per_page')) : -1; // -1 = semua
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $orderby  = $request->get_param('orderby') ? sanitize_text_field($request->get_param('orderby')) : 'id';
        $order    = $request->get_param('order') ? strtoupper(sanitize_text_field($request->get_param('order'))) : 'DESC';

        // Validasi ORDER
        if (!in_array($order, ['ASC', 'DESC'])) {
            $order = 'DESC';
        }

        // Validasi ORDER BY (Pastikan kolom ada di tabel untuk mencegah SQL Injection)
        // Untuk kesederhanaan, kita izinkan alfanumerik dan underscore saja
        $orderby = preg_replace('/[^a-zA-Z0-9_]/', '', $orderby);

        // 2. Bangun Query Dasar
        $query = "SELECT * FROM {$this->table_name} WHERE 1=1";
        $args = [];

        // 3. Tambahkan Pencarian (Jika ada kolom pencarian default)
        if (!empty($search)) {
            // Cari kolom teks di tabel ini untuk di-search
            // Ini adalah pendekatan generik, bisa di-override di child class
            $columns = $wpdb->get_col("DESCRIBE {$this->table_name}");
            $search_query = [];
            foreach ($columns as $col) {
                // Asumsi kolom teks bisa dicari (varchar/text)
                // Kita hardcode pengecualian untuk id, tanggal, dll jika perlu
                if (!in_array($col, ['id', 'created_at', 'updated_at']) && strpos($col, 'id') === false) {
                    $search_query[] = "$col LIKE %s";
                    $args[] = '%' . $wpdb->esc_like($search) . '%';
                }
            }
            
            if (!empty($search_query)) {
                $query .= " AND (" . implode(' OR ', $search_query) . ")";
            }
        }

        // 4. Sorting
        $query .= " ORDER BY $orderby $order";

        // 5. Pagination
        if ($per_page > -1) {
            $offset = ($page - 1) * $per_page;
            $query .= " LIMIT %d OFFSET %d";
            $args[] = $per_page;
            $args[] = $offset;
        }

        // 6. Eksekusi Query
        if (!empty($args)) {
            $query = $wpdb->prepare($query, $args);
        }
        
        $items = $wpdb->get_results($query);
        
        // Hitung total untuk header pagination (Opsional, menambah query count)
        $total_query = "SELECT COUNT(*) FROM {$this->table_name}";
        // Jika ada search, tambahkan where clause yang sama (disederhanakan di sini)
        $total_items = $wpdb->get_var($total_query);

        $response = new WP_REST_Response($items, 200);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $per_page > 0 ? ceil($total_items / $per_page) : 1);

        return $response;
    }

    public function get_item($request) {
        global $wpdb;
        $id = intval($request['id']);
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));

        if (!$item) {
            return new WP_Error('rest_not_found', __("{$this->item_name} tidak ditemukan.", 'umroh-manager-hybrid'), array('status' => 404));
        }
        return new WP_REST_Response($item, 200);
    }

    public function create_item($request) {
        global $wpdb;
        $data = $this->prepare_data_for_db($request->get_params());
        $format = $this->get_col_formats($data, $this->table_name);

        if (empty($data['created_at'])) $data['created_at'] = current_time('mysql');
        if (empty($data['updated_at'])) $data['updated_at'] = current_time('mysql');

        $result = $wpdb->insert($this->table_name, $data, $format);

        if ($result) {
            $new_id = $wpdb->insert_id;
            
            // Logging
            if (function_exists('umh_create_log_entry')) {
                $user_context = umh_get_current_user_context();
                $item_desc = $data['name'] ?? $data['full_name'] ?? $data['title'] ?? $this->table_name . ' item';
                umh_create_log_entry(
                    $user_context['id'], 'create', $this->table_name, $new_id,
                    "Membuat {$this->item_name}: '$item_desc'",
                    wp_json_encode(['new_data' => $data])
                );
            }
            
            $this->handle_relations($new_id, $request->get_params());
            $new_item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $new_id));
            return new WP_REST_Response($new_item, 201);
        } else {
            return new WP_Error('rest_cannot_create', __("Gagal membuat {$this->item_name}.", 'umroh-manager-hybrid'), array('status' => 500, 'db_error' => $wpdb->last_error));
        }
    }

    public function update_item($request) {
        global $wpdb;
        $id = intval($request['id']);
        $data = $this->prepare_data_for_db($request->get_params());
        unset($data['id']); 

        if (empty($data)) return new WP_Error('rest_no_data', __("Tidak ada data update.", 'umroh-manager-hybrid'), array('status' => 400));

        $data['updated_at'] = current_time('mysql');
        $format = $this->get_col_formats($data, $this->table_name);
        $old_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);

        $result = $wpdb->update($this->table_name, $data, array('id' => $id), $format, array('%d'));

        if ($result !== false) {
            // Logging
            if (function_exists('umh_create_log_entry') && $old_data) {
                $user_context = umh_get_current_user_context();
                $item_desc = $data['name'] ?? $data['full_name'] ?? $old_data['name'] ?? 'item';
                umh_create_log_entry(
                    $user_context['id'], 'update', $this->table_name, $id,
                    "Update {$this->item_name}: '$item_desc'",
                    wp_json_encode(['new' => $data, 'old' => $old_data])
                );
            }

            $this->handle_relations($id, $request->get_params());
            $updated_item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
            return new WP_REST_Response($updated_item, 200);
        } else {
            return new WP_Error('rest_cannot_update', __("Gagal update.", 'umroh-manager-hybrid'), array('status' => 500));
        }
    }

    public function delete_item($request) {
        global $wpdb;
        $id = intval($request['id']);
        $old_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);
        $result = $wpdb->delete($this->table_name, array('id' => $id), array('%d'));

        if ($result) {
             if (function_exists('umh_create_log_entry') && $old_data) {
                $user_context = umh_get_current_user_context();
                $item_desc = $old_data['name'] ?? $old_data['full_name'] ?? 'item';
                umh_create_log_entry(
                    $user_context['id'], 'delete', $this->table_name, $id,
                    "Hapus {$this->item_name}: '$item_desc'",
                    wp_json_encode($old_data)
                );
            }
            return new WP_REST_Response(array('message' => 'Item deleted', 'id' => $id), 200);
        } else {
            return new WP_Error('rest_cannot_delete', __("Gagal hapus.", 'umroh-manager-hybrid'), array('status' => 500));
        }
    }

    // --- Helpers ---
    protected function prepare_data_for_db($params) {
        global $wpdb;
        // Cache kolom untuk performa (transient bisa ditambahkan nanti)
        $columns = $wpdb->get_col_info("SELECT * FROM {$this->table_name} LIMIT 1", -1);
        $column_names = wp_list_pluck($columns, 'name');
        
        $data = array();
        foreach ($column_names as $column) {
            if (isset($params[$column])) {
                $data[$column] = is_bool($params[$column]) ? ($params[$column] ? 1 : 0) : $params[$column];
            }
        }
        return $data;
    }

    protected function get_col_formats($data, $table) {
        global $wpdb;
        $formats = array();
        $columns = $wpdb->get_results("SHOW COLUMNS FROM {$table}", ARRAY_A);
        $column_types = array();
        foreach ($columns as $col) $column_types[$col['Field']] = $col['Type'];

        foreach ($data as $key => $value) {
            if (isset($column_types[$key])) {
                $type = $column_types[$key];
                if (strpos($type, 'int') !== false) $formats[] = '%d';
                elseif (strpos($type, 'float') !== false || strpos($type, 'decimal') !== false || strpos($type, 'double') !== false) $formats[] = '%f';
                else $formats[] = '%s';
            } else {
                $formats[] = '%s';
            }
        }
        return $formats;
    }

    protected function handle_relations($item_id, $params) {
        global $wpdb;
        if (empty($this->relations)) return;

        foreach ($this->relations as $key => $config) {
            if (isset($params[$key])) {
                $table = $config['table'];
                $item_col = $config['item_col'];
                $rel_col = $config['relation_col'];
                $ids = (array) $params[$key];

                $wpdb->delete($table, array($item_col => $item_id), array('%d'));
                foreach ($ids as $rel_id) {
                    if (intval($rel_id) > 0) {
                        $wpdb->insert($table, array($item_col => $item_id, $rel_col => intval($rel_id)), array('%d', '%d'));
                    }
                }
            }
        }
    }
    
    protected function get_sanitize_callback($type) {
        switch ($type) {
            case 'integer': return 'absint';
            case 'number': return 'floatval';
            case 'boolean': return 'rest_sanitize_boolean';
            default: return 'sanitize_text_field';
        }
    }

    public function get_endpoint_args_for_item_schema($method) {
        return []; 
    }
}