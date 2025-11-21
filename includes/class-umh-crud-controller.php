<?php
// Lokasi: includes/class-umh-crud-controller.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Class UMH_CRUD_Controller
 *
 * Kontroler generik untuk menangani operasi CRUD otomatis
 * dengan perbaikan pada pengambilan struktur tabel.
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

    public function get_items($request) {
        global $wpdb;

        $page     = $request->get_param('page') ? intval($request->get_param('page')) : 1;
        $per_page = $request->get_param('per_page') ? intval($request->get_param('per_page')) : -1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $orderby  = $request->get_param('orderby') ? sanitize_text_field($request->get_param('orderby')) : 'id';
        $order    = $request->get_param('order') ? strtoupper(sanitize_text_field($request->get_param('order'))) : 'DESC';

        if (!in_array($order, ['ASC', 'DESC'])) $order = 'DESC';
        $orderby = preg_replace('/[^a-zA-Z0-9_]/', '', $orderby);

        $query = "SELECT * FROM {$this->table_name} WHERE 1=1";
        $args = [];

        // Fitur Search Otomatis
        if (!empty($search)) {
            $columns = $wpdb->get_results("DESCRIBE {$this->table_name}");
            $search_query = [];
            foreach ($columns as $col) {
                $field = $col->Field;
                $type = $col->Type;
                // Cari hanya di kolom teks
                if (strpos($type, 'char') !== false || strpos($type, 'text') !== false) {
                     $search_query[] = "$field LIKE %s";
                     $args[] = '%' . $wpdb->esc_like($search) . '%';
                }
            }
            if (!empty($search_query)) {
                $query .= " AND (" . implode(' OR ', $search_query) . ")";
            }
        }

        $query .= " ORDER BY $orderby $order";

        if ($per_page > -1) {
            $offset = ($page - 1) * $per_page;
            $query .= " LIMIT %d OFFSET %d";
            $args[] = $per_page;
            $args[] = $offset;
        }

        if (!empty($args)) {
            $query = $wpdb->prepare($query, $args);
        }
        
        $items = $wpdb->get_results($query);
        
        // Hitung total
        $total_query = "SELECT COUNT(*) FROM {$this->table_name}";
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
        // FIX: Ambil kolom yang valid dulu
        $data = $this->prepare_data_for_db($request->get_params());
        
        if (empty($data)) {
            return new WP_Error('rest_empty_data', "Data tidak valid atau nama kolom tidak cocok dengan database.", array('status' => 400));
        }

        $format = $this->get_col_formats($data, $this->table_name);

        // Auto timestamp
        if (!isset($data['created_at']) && $this->column_exists('created_at')) {
            $data['created_at'] = current_time('mysql');
        }

        $result = $wpdb->insert($this->table_name, $data, $format);

        if ($result) {
            $new_id = $wpdb->insert_id;
            $this->log_activity('create', $new_id, $data);
            $this->handle_relations($new_id, $request->get_params());
            
            $new_item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $new_id));
            return new WP_REST_Response($new_item, 201);
        } else {
            return new WP_Error('rest_cannot_create', "Gagal membuat data. DB Error: " . $wpdb->last_error, array('status' => 500));
        }
    }

    public function update_item($request) {
        global $wpdb;
        $id = intval($request['id']);
        $data = $this->prepare_data_for_db($request->get_params());
        
        // Bersihkan ID dari data update
        unset($data['id']); 

        if (empty($data)) return new WP_Error('rest_no_data', "Tidak ada data update yang valid.", array('status' => 400));

        if ($this->column_exists('updated_at')) {
            $data['updated_at'] = current_time('mysql');
        }
        
        $format = $this->get_col_formats($data, $this->table_name);
        $old_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);

        $result = $wpdb->update($this->table_name, $data, array('id' => $id), $format, array('%d'));

        if ($result !== false) {
            $this->log_activity('update', $id, ['new' => $data, 'old' => $old_data]);
            $this->handle_relations($id, $request->get_params());
            
            $updated_item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
            return new WP_REST_Response($updated_item, 200);
        } else {
            return new WP_Error('rest_cannot_update', "Gagal update database.", array('status' => 500));
        }
    }

    public function delete_item($request) {
        global $wpdb;
        $id = intval($request['id']);
        $old_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);
        
        if (!$old_data) return new WP_Error('rest_not_found', "Data tidak ditemukan", array('status' => 404));

        $result = $wpdb->delete($this->table_name, array('id' => $id), array('%d'));

        if ($result) {
            $this->log_activity('delete', $id, $old_data);
            return new WP_REST_Response(array('message' => 'Item deleted', 'id' => $id), 200);
        } else {
            return new WP_Error('rest_cannot_delete', "Gagal hapus data.", array('status' => 500));
        }
    }

    // --- Helpers ---
    
    protected function column_exists($column) {
        global $wpdb;
        $row = $wpdb->get_results("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '{$this->table_name}' AND column_name = '{$column}'");
        return !empty($row);
    }

    protected function prepare_data_for_db($params) {
        global $wpdb;
        // FIX: Gunakan DESCRIBE, bukan get_col_info yang salah
        $columns = $wpdb->get_results("DESCRIBE {$this->table_name}");
        $valid_columns = wp_list_pluck($columns, 'Field');
        
        $data = array();
        foreach ($valid_columns as $col) {
            if ($col === 'id') continue; // Skip ID auto-increment
            
            if (isset($params[$col])) {
                $val = $params[$col];
                // Konversi boolean ke 1/0 untuk MySQL
                if (is_bool($val)) $val = $val ? 1 : 0;
                // Abaikan array/object (harus di-serialize manual jika perlu)
                if (!is_array($val) && !is_object($val)) {
                    $data[$col] = $val;
                }
            }
        }
        return $data;
    }

    protected function get_col_formats($data, $table) {
        global $wpdb;
        $formats = array();
        $columns = $wpdb->get_results("DESCRIBE {$table}");
        $col_types = array();
        foreach ($columns as $c) $col_types[$c->Field] = $c->Type;

        foreach ($data as $key => $value) {
            if (isset($col_types[$key])) {
                $t = $col_types[$key];
                if (strpos($t, 'int') !== false || strpos($t, 'bigint') !== false) $formats[] = '%d';
                elseif (strpos($t, 'float') !== false || strpos($t, 'decimal') !== false || strpos($t, 'double') !== false) $formats[] = '%f';
                else $formats[] = '%s';
            } else {
                $formats[] = '%s';
            }
        }
        return $formats;
    }

    protected function log_activity($action, $id, $data) {
        if (function_exists('umh_create_log_entry')) {
            $user = umh_get_current_user_context();
            $desc = "{$action} {$this->item_name} #{$id}";
            // Coba cari nama item untuk log yang lebih informatif
            if (is_array($data) && isset($data['name'])) $desc .= " ({$data['name']})";
            elseif (isset($data['new']['name'])) $desc .= " ({$data['new']['name']})";
            
            umh_create_log_entry($user['id'], $action, $this->table_name, $id, $desc, json_encode($data));
        }
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
    
    public function get_endpoint_args_for_item_schema($method) { return []; }
}