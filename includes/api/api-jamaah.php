<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Jamaah {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/jamaah', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true']
        ]);
        // Route detail / delete / update by ID jika diperlukan, 
        // tapi POST di atas biasanya sudah handle create/update
    }

    public function get_items( $request ) {
        global $wpdb;
        $search = $request->get_param('search');

        $sql = "SELECT j.*, p.name as package_name, b.id as booking_id,
                (SELECT SUM(amount) FROM {$wpdb->prefix}umh_payments WHERE booking_id = b.id AND status='verified') as total_paid,
                b.total_price
                FROM {$wpdb->prefix}umh_jamaah j
                LEFT JOIN {$wpdb->prefix}umh_bookings b ON j.id = b.jamaah_id
                LEFT JOIN {$wpdb->prefix}umh_packages p ON b.package_id = p.id
                WHERE 1=1";

        if ( !empty($search) ) {
            $like = '%' . $wpdb->esc_like( $search ) . '%';
            $sql .= $wpdb->prepare(" AND (j.full_name LIKE %s OR j.passport_number LIKE %s)", $like, $like);
        }

        $sql .= " ORDER BY j.created_at DESC LIMIT 50";
        
        $results = $wpdb->get_results($sql);

        // Hitung status pembayaran sederhana
        foreach($results as $row) {
            if ($row->total_price > 0 && $row->total_paid >= $row->total_price) {
                $row->payment_status = 'lunas';
            } else {
                $row->payment_status = 'belum lunas';
            }
        }

        return rest_ensure_response( $results );
    }

    public function create_item( $request ) {
        global $wpdb;
        $p = $request->get_json_params();

        // Simpan data Jemaah
        $jamaah_data = [
            'full_name' => sanitize_text_field($p['full_name']),
            'passport_number' => sanitize_text_field($p['passport_number']),
            'phone_number' => sanitize_text_field($p['phone_number']),
            'address' => sanitize_textarea_field($p['address']),
            // ... field lain sesuai kebutuhan form
        ];

        if(!empty($p['id'])) {
            $wpdb->update($wpdb->prefix.'umh_jamaah', $jamaah_data, ['id'=>$p['id']]);
            $jamaah_id = $p['id'];
        } else {
            $wpdb->insert($wpdb->prefix.'umh_jamaah', $jamaah_data);
            $jamaah_id = $wpdb->insert_id;
        }

        // Jika ada paket yang dipilih, buat Booking otomatis
        if (!empty($p['package_id'])) {
            // Cek harga paket
            $price = $wpdb->get_var($wpdb->prepare("SELECT price FROM {$wpdb->prefix}umh_packages WHERE id=%d", $p['package_id']));
            
            $wpdb->insert($wpdb->prefix.'umh_bookings', [
                'jamaah_id' => $jamaah_id,
                'package_id' => intval($p['package_id']),
                'booking_date' => current_time('mysql'),
                'total_price' => $price,
                'status' => 'confirmed'
            ]);
        }

        return rest_ensure_response(['message' => 'Data Jemaah tersimpan']);
    }
}
new UMH_API_Jamaah();