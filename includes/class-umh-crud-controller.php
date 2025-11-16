<?php
// File: includes/class-umh-crud-controller.php
// [BARU] Controller Generik untuk menangani operasi CRUD API.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Class UMH_CRUD_Controller
 *
 * Sebuah controller generik untuk mendaftarkan endpoint REST API
 * untuk operasi CRUD (Create, Read, Update, Delete) pada tabel database kustom.
 */
class UMH_CRUD_Controller {

    /**
     * @var string Namespace REST API (e.g., 'umh/v1')
     */
    protected $namespace;

    /**
     * @var string Base dari endpoint (e.g., 'tasks', 'hotels')
     */
    protected $rest_base;

    /**
     * @var string Nama tabel database (tanpa prefix) (e.g., 'umh_tasks')
     */
    protected $table_name;

    /**
     * @var array Skema item (untuk validasi & sanitasi)
     */
    protected $item_schema;
    
    /**
     * @var array Peran yang diizinkan untuk CRUD
     */
    protected $permissions = [];

    /**
     * Konstruktor
     *
     * @param string $rest_base   Base endpoint (e.g., 'tasks')
     * @param string $table_slug  Nama tabel (tanpa prefix) (e.g., 'umh_tasks')
     * @param array  $item_schema Skema data dari register_rest_route (args)
     * @param array  $permissions Peran yang diizinkan (e.g., ['get' => ['owner'], 'post' => ['owner', 'admin_staff']])
     */
    public function __construct($rest_base, $table_slug, $item_schema, $permissions = []) {
        global $wpdb;
        $this->namespace   = 'umh/v1';
        $this->rest_base   = $rest_base;
        $this->table_name  = $wpdb->prefix . $table_slug;
        $this->item_schema = $item_schema;
        
        // Atur izin default jika tidak disediakan
        $this->permissions = wp_parse_args($permissions, [
            'get_items'    => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
            'get_item'     => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
            'create_item'  => ['owner', 'admin_staff'],
            'update_item'  => ['owner', 'admin_staff'],
            'delete_item'  => ['owner'],
        ]);

        // Daftarkan route saat inisialisasi
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Mendaftarkan rute REST API
     */
    public function register_routes() {
        // Rute untuk koleksi (e.g., /tasks)
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_items'],
                'permission_callback' => umh_check_api_permission($this->permissions['get_items']),
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'create_item'],
                'permission_callback' => umh_check_api_permission($this->permissions['create_item']),
                'args'                => $this->get_endpoint_args(false),
            ],
        ]);

        // Rute untuk satu item (e.g., /tasks/123)
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>\d+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => umh_check_api_permission($this->permissions['get_item']),
            ],
            [
                'methods'             => WP_REST_Server::EDITABLE, // Bisa POST, PUT, PATCH
                'callback'            => [$this, 'update_item'],
                'permission_callback' => umh_check_api_permission($this->permissions['update_item']),
                'args'                => $this->get_endpoint_args(true),
            ],
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'delete_item'],
                'permission_callback' => umh_check_api_permission($this->permissions['delete_item']),
            ],
        ]);
    }
    
    /**
     * Helper untuk membuat argumen 'required' menjadi false saat update
     */
    protected function get_endpoint_args($is_update = false) {
        $args = $this->item_schema;
        if ($is_update) {
            foreach ($args as $key => &$field) {
                $field['required'] = false;
            }
        }
        return $args;
    }

    /**
     * Menyiapkan data untuk database, hanya mengambil field yang ada di skema
     * dan menjalankan sanitasi.
     *
     * @param WP_REST_Request $request
     * @return array Data yang sudah disanitasi
     */
    protected function prepare_item_for_db($request) {
        $prepared_item = [];
        $params = $request->get_json_params();

        foreach ($this->item_schema as $key => $schema) {
            if (isset($params[$key])) {
                $value = $params[$key];
                
                // Jalankan sanitasi jika ada
                if (isset($schema['sanitize_callback'])) {
                    $value = call_user_func($schema['sanitize_callback'], $value, $request, $key);
                }
                
                $prepared_item[$key] = $value;
            }
        }
        return $prepared_item;
    }

    // --- Callback CRUD ---

    public function get_items(WP_REST_Request $request) {
        global $wpdb;
        
        // TODO: Tambahkan logika pagination & filtering jika perlu
        $results = $wpdb->get_results("SELECT * FROM $this->table_name", ARRAY_A);
        
        if ($results === false) {
            return new WP_Error('db_error', __('Database error.', 'umh'), ['status' => 500]);
        }
        return new WP_REST_Response($results, 200);
    }

    public function get_item(WP_REST_Request $request) {
        global $wpdb;
        $id = (int) $request['id'];
        
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM $this->table_name WHERE id = %d", $id), ARRAY_A);
        
        if (!$item) {
            return new WP_Error('not_found', __('Item not found.', 'umh'), ['status' => 404]);
        }
        return new WP_REST_Response($item, 200);
    }

    public function create_item(WP_REST_Request $request) {
        global $wpdb;
        
        $data = $this->prepare_item_for_db($request);
        if (empty($data)) {
            return new WP_Error('bad_request', __('No valid data provided.', 'umh'), ['status' => 400]);
        }
        
        // Tambahkan timestamp
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        
        // Tambahkan created_by_user_id jika ada di skema
        if (array_key_exists('created_by_user_id', $this->item_schema)) {
             $context = umh_get_current_user_context($request);
             if (!is_wp_error($context)) {
                 $data['created_by_user_id'] = $context['user_id'];
             }
        }

        $result = $wpdb->insert($this->table_name, $data);
        
        if ($result === false) {
            return new WP_Error('db_error', __('Failed to create item.', 'umh'), ['status' => 500, 'db_error' => $wpdb->last_error]);
        }
        
        $new_id = $wpdb->insert_id;
        // TODO: Panggil umh_create_log_entry() di sini
        
        return new WP_REST_Response(['id' => $new_id, 'message' => 'Item created successfully.'], 201);
    }

    public function update_item(WP_REST_Request $request) {
        global $wpdb;
        $id = (int) $request['id'];
        
        $data = $this->prepare_item_for_db($request);
        if (empty($data)) {
            return new WP_Error('bad_request', __('No valid data provided for update.', 'umh'), ['status' => 400]);
        }
        
        // Tambahkan timestamp
        $data['updated_at'] = current_time('mysql');

        $result = $wpdb->update($this->table_name, $data, ['id' => $id]);
        
        if ($result === false) {
            return new WP_Error('db_error', __('Failed to update item.', 'umh'), ['status' => 500, 'db_error' => $wpdb->last_error]);
        }
        
        // TODO: Panggil umh_create_log_entry() di sini

        return new WP_REST_Response(['id' => $id, 'message' => 'Item updated successfully.'], 200);
    }

    public function delete_item(WP_REST_Request $request) {
        global $wpdb;
        $id = (int) $request['id'];

        $result = $wpdb->delete($this->table_name, ['id' => $id]);
        
        if ($result === false) {
            return new WP_Error('db_error', __('Failed to delete item.', 'umh'), ['status' => 500]);
        }
        
        if ($result === 0) {
            return new WP_Error('not_found', __('Item not found to delete.', 'umh'), ['status' => 404]);
        }
        
        // TODO: Panggil umh_create_log_entry() di sini

        return new WP_REST_Response(['id' => $id, 'message' => 'Item deleted successfully.'], 200);
    }
}