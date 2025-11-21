<?php
if (!defined('ABSPATH')) exit;

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_API_Jamaah extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_jamaah');
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/jamaah', [
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

        register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', [
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
                'callback' => [$this, 'delete_item'], // Safe Delete Implementation
                'permission_callback' => [$this, 'check_permission'],
            ]
        ]);
    }

    // Override Get Items agar yang 'deleted' tidak muncul
    public function get_items($request) {
        global $wpdb;
        $params = $request->get_params();
        
        // Default filter: sembunyikan yang deleted
        $where = "WHERE status != 'deleted'"; 
        $args = [];

        // Search Logic
        if (isset($params['search'])) {
            $where .= " AND (full_name LIKE %s OR passport_number LIKE %s OR phone_number LIKE %s)";
            $term = '%' . $wpdb->esc_like($params['search']) . '%';
            $args[] = $term;
            $args[] = $term;
            $args[] = $term;
        }

        // Filter by Package/Booking (Opsional)
        // ... logic filter lain ...

        $query = "SELECT * FROM {$this->table_name} $where ORDER BY created_at DESC";
        
        if (!empty($args)) {
            $items = $wpdb->get_results($wpdb->prepare($query, $args));
        } else {
            $items = $wpdb->get_results($query);
        }

        return rest_ensure_response($items);
    }

    // Override Delete Item (SOFT DELETE - SAFETY FIRST)
    public function delete_item($request) {
        global $wpdb;
        $id = $request['id'];

        // Cek apakah jamaah punya data keuangan?
        $has_payment = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}umh_jamaah_payments WHERE jamaah_id = %d LIMIT 1", 
            $id
        ));

        // Jika sudah ada pembayaran, JANGAN hapus fisik. Lakukan Soft Delete.
        if ($has_payment) {
            $updated = $wpdb->update(
                $this->table_name,
                ['status' => 'deleted'], // Ubah status jadi deleted/trash
                ['id' => $id]
            );
            
            if ($updated === false) {
                return new WP_Error('db_error', 'Gagal menghapus data', ['status' => 500]);
            }
            
            return rest_ensure_response(['success' => true, 'message' => 'Data dipindahkan ke sampah (Soft Delete) karena memiliki riwayat transaksi.']);
        }

        // Jika data masih bersih (belum ada transaksi), boleh hapus permanen
        return parent::delete_item($request);
    }

    public function prepare_item_for_database($request) {
        $data = [
            'full_name' => sanitize_text_field($request['full_name']),
            'nik' => sanitize_text_field($request['nik']),
            'passport_number' => sanitize_text_field($request['passport_number']),
            'gender' => sanitize_text_field($request['gender']),
            'phone_number' => sanitize_text_field($request['phone_number']),
            'sub_agent_id' => isset($request['sub_agent_id']) ? intval($request['sub_agent_id']) : 0,
            'branch_id' => isset($request['branch_id']) ? intval($request['branch_id']) : 0, // Support Cabang
            'status' => sanitize_text_field($request['status']),
        ];
        
        // Handle Date Fields (cegah error jika kosong)
        if (!empty($request['birth_date'])) $data['birth_date'] = sanitize_text_field($request['birth_date']);
        if (!empty($request['passport_issued'])) $data['passport_issued'] = sanitize_text_field($request['passport_issued']);
        if (!empty($request['passport_expiry'])) $data['passport_expiry'] = sanitize_text_field($request['passport_expiry']);

        return $data;
    }
}