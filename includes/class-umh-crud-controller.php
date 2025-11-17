<?php
// Lokasi: includes/class-umh-crud-controller.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Class UMH_CRUD_Controller
 *
 * Kontroler generik untuk menangani operasi CRUD pada tabel kustom
 * melalui WordPress REST API.
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

    /**
     * Constructor.
     *
     * @param string $table_name Nama tabel database (dengan prefix).
     * @param string $item_name  Nama item singular (misal: 'jamaah').
     * @param array  $permissions Array asosiatif untuk izin per-endpoint.
     * @param array  $relations   Array untuk mendefinisikan relasi many-to-many.
     */
    public function __construct($table_name, $item_name, $permissions = array(), $relations = array()) {
        $this->table_name = $table_name;
        $this->item_name = $item_name;
        // Gabungkan izin default dengan izin kustom
        $this->permissions = wp_parse_args($permissions, $this->default_permissions);
        $this->relations = $relations;
    }

    /**
     * Mendapatkan semua item dari tabel.
     */
    public function get_items($request) {
        global $wpdb;
        // TODO: Tambahkan pagination
        $items = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY id DESC");
        return new WP_REST_Response($items, 200);
    }

    /**
     * Mendapatkan satu item berdasarkan ID.
     */
    public function get_item($request) {
        global $wpdb;
        $id = intval($request['id']);
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));

        if (!$item) {
            return new WP_Error('rest_not_found', __("{$this->item_name} tidak ditemukan.", 'umroh-manager-hybrid'), array('status' => 404));
        }
        return new WP_REST_Response($item, 200);
    }

    /**
     * Membuat item baru.
     */
    public function create_item($request) {
        global $wpdb;
        $data = $this->prepare_data_for_db($request->get_params());
        $format = $this->get_col_formats($data, $this->table_name);

        // --- PERBAIKAN: Tambahkan created_at dan updated_at jika ada di params ---
        if (empty($data['created_at'])) {
            $data['created_at'] = current_time('mysql');
        }
        if (empty($data['updated_at'])) {
            $data['updated_at'] = current_time('mysql');
        }
        // --- AKHIR PERBAIKAN ---

        $result = $wpdb->insert($this->table_name, $data, $format);

        if ($result) {
            $new_id = $wpdb->insert_id;
            
            // <!-- PERBAIKAN (Kategori 3): Implementasi Logging -->
            if (function_exists('umh_create_log_entry')) {
                $user_context = umh_get_current_user_context();
                // Coba dapatkan nama/deskripsi item untuk log
                $item_desc = $data['name'] ?? $data['full_name'] ?? $data['title'] ?? $data['description'] ?? $this->table_name . ' item';
                umh_create_log_entry(
                    $user_context['id'],
                    'create',
                    $this->table_name,
                    $new_id,
                    "Membuat item baru di {$this->table_name}: '{$item_desc}' (ID: {$new_id})",
                    wp_json_encode(array('new_data' => $data)) // Data baru
                );
            }
            // <!-- AKHIR PERBAIKAN -->
            
            // Handle relasi (jika ada)
            $this->handle_relations($new_id, $request->get_params());

            // Ambil item yang baru dibuat
            $new_item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $new_id));
            return new WP_REST_Response($new_item, 201);
        } else {
            return new WP_Error('rest_cannot_create', __("Gagal membuat {$this->item_name}.", 'umroh-manager-hybrid'), array('status' => 500, 'db_error' => $wpdb->last_error));
        }
    }

    /**
     * Memperbarui item yang ada.
     */
    public function update_item($request) {
        global $wpdb;
        $id = intval($request['id']);
        $data = $this->prepare_data_for_db($request->get_params());
        
        // Hapus 'id' dari data update
        unset($data['id']); 

        if (empty($data)) {
             return new WP_Error('rest_no_data_to_update', __("Tidak ada data untuk diperbarui.", 'umroh-manager-hybrid'), array('status' => 400));
        }

        // --- PERBAIKAN: Tambahkan updated_at ---
        if (empty($data['updated_at'])) {
            $data['updated_at'] = current_time('mysql');
        }
        // --- AKHIR PERBAIKAN ---

        $format = $this->get_col_formats($data, $this->table_name);

        // Ambil data lama sebelum update untuk perbandingan log
        $old_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);

        $result = $wpdb->update($this->table_name, $data, array('id' => $id), $format, array('%d'));

        if ($result !== false) {
            
            // <!-- PERBAIKAN (Kategori 3): Implementasi Logging -->
            if (function_exists('umh_create_log_entry') && $old_data) {
                $user_context = umh_get_current_user_context();
                $item_desc = $data['name'] ?? $data['full_name'] ?? $data['title'] ?? $old_data['name'] ?? $old_data['full_name'] ?? $old_data['title'] ?? $this->table_name . ' item';
                umh_create_log_entry(
                    $user_context['id'],
                    'update',
                    $this->table_name,
                    $id,
                    "Memperbarui item di {$this->table_name}: '{$item_desc}' (ID: {$id})",
                    wp_json_encode(array('new_data' => $data, 'old_data' => $old_data)) // Data baru & lama
                );
            }
            // <!-- AKHIR PERBAIKAN -->

            // Handle relasi (jika ada)
            $this->handle_relations($id, $request->get_params());

            // Ambil item yang baru diupdate
            $updated_item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
            return new WP_REST_Response($updated_item, 200);
        } else {
            return new WP_Error('rest_cannot_update', __("Gagal memperbarui {$this->item_name}.", 'umroh-manager-hybrid'), array('status' => 500, 'db_error' => $wpdb->last_error));
        }
    }

    /**
     * Menghapus item.
     */
    public function delete_item($request) {
        global $wpdb;
        $id = intval($request['id']);

        // Ambil data lama sebelum hapus untuk log
        $old_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);

        $result = $wpdb->delete($this->table_name, array('id' => $id), array('%d'));

        if ($result) {
            
            // <!-- PERBAIKAN (Kategori 3): Implementasi Logging -->
            if (function_exists('umh_create_log_entry') && $old_data) {
                $user_context = umh_get_current_user_context();
                $item_desc = $old_data['name'] ?? $old_data['full_name'] ?? $old_data['title'] ?? $old_data['description'] ?? $this->table_name . ' item';
                umh_create_log_entry(
                    $user_context['id'],
                    'delete',
                    $this->table_name,
                    $id,
                    "Menghapus item dari {$this->table_name}: '{$item_desc}' (ID: {$id})",
                    wp_json_encode($old_data) // Data lama yang dihapus
                );
            }
            // <!-- AKHIR PERBAIKAN -->

            return new WP_REST_Response(array('message' => 'Item deleted successfully', 'id' => $id), 200);
        } else {
            return new WP_Error('rest_cannot_delete', __("Gagal menghapus {$this->item_name}.", 'umroh-manager-hybrid'), array('status' => 500));
        }
    }

    /**
     * Mempersiapkan data untuk disimpan ke DB.
     * Membersihkan parameter yang tidak ada di skema tabel.
     */
    protected function prepare_data_for_db($params) {
        global $wpdb;
        $columns = $wpdb->get_col_info("SELECT * FROM {$this->table_name} LIMIT 1", -1);
        $column_names = wp_list_pluck($columns, 'name');
        
        $data = array();
        foreach ($column_names as $column) {
            if (isset($params[$column])) {
                // --- PERBAIKAN: Konversi boolean ke 0/1 untuk DB ---
                if (is_bool($params[$column])) {
                    $data[$column] = $params[$column] ? 1 : 0;
                } else {
                    $data[$column] = $params[$column];
                }
                // --- AKHIR PERBAIKAN ---
            }
        }
        return $data;
    }

    /**
     * Mendapatkan format kolom (misal: %s, %d) untuk $wpdb->insert/update.
     */
    protected function get_col_formats($data, $table) {
        global $wpdb;
        $formats = array();
        $columns = $wpdb->get_results("SHOW COLUMNS FROM {$table}", ARRAY_A);
        
        $column_types = array();
        foreach ($columns as $col) {
            $column_types[$col['Field']] = $col['Type'];
        }

        foreach ($data as $key => $value) {
            if (isset($column_types[$key])) {
                $type = $column_types[$key];
                if (strpos($type, 'int') !== false) {
                    $formats[] = '%d';
                } elseif (strpos($type, 'float') !== false || strpos($type, 'double') !== false || strpos($type, 'decimal') !== false) {
                    $formats[] = '%f';
                } else {
                    $formats[] = '%s';
                }
            } else {
                // Default ke string jika kolom tidak ditemukan (seharusnya tidak terjadi)
                $formats[] = '%s';
            }
        }
        return $formats;
    }

    /**
     * Handle relasi many-to-many.
     */
    protected function handle_relations($item_id, $params) {
        global $wpdb;
        if (empty($this->relations)) {
            return;
        }

        foreach ($this->relations as $relation_key => $config) {
            if (isset($params[$relation_key])) {
                $relation_table = $config['table'];
                $item_col = $config['item_col'];
                $relation_col = $config['relation_col'];
                $ids = (array) $params[$relation_key];

                // 1. Hapus relasi lama
                $wpdb->delete($relation_table, array($item_col => $item_id), array('%d'));

                // 2. Masukkan relasi baru
                if (!empty($ids)) {
                    foreach ($ids as $rel_id) {
                        if (intval($rel_id) > 0) {
                            $wpdb->insert(
                                $relation_table,
                                array(
                                    $item_col => $item_id,
                                    $relation_col => intval($rel_id)
                                ),
                                array('%d', '%d')
                            );
                        }
                    }
                }
            }
        }
    }

    /**
     * Helper untuk get_endpoint_args_for_item_schema (Schema validasi).
     */
    public function get_endpoint_args_for_item_schema($method) {
        global $wpdb;
        $columns = $wpdb->get_results("SHOW COLUMNS FROM {$this->table_name}", ARRAY_A);
        $args = array();

        foreach ($columns as $col) {
            $name = $col['Field'];
            if ($name === 'id') continue; // ID tidak boleh di-set saat create/update

            $type = $this->map_db_type_to_rest_type($col['Type']);
            $required = ($col['Null'] === 'NO' && $col['Default'] === null && $col['Extra'] !== 'auto_increment');

            // --- PERBAIKAN: Jangan wajibkan 'created_at' dan 'updated_at' ---
            if ($name === 'created_at' || $name === 'updated_at') {
                $required = false;
            }
            // --- AKHIR PERBAIKAN ---

            $args[$name] = array(
                'description' => sprintf(__('Kolom %s untuk %s', 'umroh-manager-hybrid'), $name, $this->item_name),
                'type'        => $type,
                'required'    => $method === WP_REST_Server::CREATABLE ? $required : false,
                 // --- PERBAIKAN: Tambahkan sanitasi berdasarkan tipe ---
                'sanitize_callback' => $this->get_sanitize_callback($type),
                 // --- AKHIR PERBAIKAN ---
            );
            
            if ($type === 'array') {
                $args[$name]['items'] = array('type' => 'string'); // Asumsi array of strings
            }
            if ($type === 'object') {
                $args[$name]['properties'] = array(); // Asumsi object
            }
        }

        // Tambahkan arg untuk relasi (jika ada)
        foreach ($this->relations as $relation_key => $config) {
             $args[$relation_key] = array(
                'description' => sprintf(__('Array of IDs for %s relation', 'umroh-manager-hybrid'), $relation_key),
                'type'        => 'array',
                'items'       => array('type' => 'integer'),
                'required'    => false,
            );
        }

        return $args;
    }

    /**
     * Map tipe data DB ke tipe data REST API.
     */
    protected function map_db_type_to_rest_type($db_type) {
        if (strpos($db_type, 'int') !== false) return 'integer';
        if (strpos($db_type, 'decimal') !== false || strpos($db_type, 'float') !== false || strpos($db_type, 'double') !== false) return 'number';
        if (strpos($db_type, 'json') !== false) return 'object'; // Bisa juga 'array'
        if (strpos($db_type, 'text') !== false || strpos($db_type, 'varchar') !== false || strpos($db_type, 'date') !== false) return 'string';
        if (strpos($db_type, 'boolean') !== false || strpos($db_type, 'tinyint(1)') !== false) return 'boolean';
        return 'string';
    }

    // --- PERBAIKAN: Tambahkan helper sanitasi ---
    /**
     * Mendapatkan callback sanitasi default berdasarkan tipe REST.
     */
    protected function get_sanitize_callback($type) {
        switch ($type) {
            case 'integer':
                return 'absint';
            case 'number':
                return 'floatval';
            case 'boolean':
                return 'rest_sanitize_boolean';
            case 'string':
            default:
                return 'sanitize_text_field';
        }
    }
    // --- AKHIR PERBAIKAN ---
}