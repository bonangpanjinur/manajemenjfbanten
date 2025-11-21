<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Packages {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/packages', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true']
        ]);
        register_rest_route( 'umh/v1', '/packages/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'PUT', 'callback' => [$this, 'update_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_items( $request ) {
        global $wpdb;
        $status = $request->get_param('status');
        
        // Query Utama
        $sql = "SELECT p.*, a.name as airline_name, c.name as category_name 
                FROM {$wpdb->prefix}umh_packages p
                LEFT JOIN {$wpdb->prefix}umh_airlines a ON p.airline_id = a.id
                LEFT JOIN {$wpdb->prefix}umh_categories c ON p.category_id = c.id
                WHERE 1=1";
        
        if($status && $status !== 'all') $sql .= $wpdb->prepare(" AND p.status = %s", $status);
        $sql .= " ORDER BY p.departure_date ASC";
        
        $packages = $wpdb->get_results($sql);

        // Hydrate Relation Data (Prices & Hotels)
        // Loop ini bisa dioptimasi dengan JOIN, tapi untuk simplifikasi readability kita loop dulu
        foreach($packages as $pkg) {
            $pkg->pricing_variants = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_package_prices WHERE package_id = %d", $pkg->id));
            $pkg->hotels = $wpdb->get_results($wpdb->prepare("
                SELECT ph.*, h.name as hotel_name, h.star_rating 
                FROM {$wpdb->prefix}umh_package_hotels ph
                JOIN {$wpdb->prefix}umh_hotels h ON ph.hotel_id = h.id
                WHERE ph.package_id = %d
            ", $pkg->id));
        }

        return rest_ensure_response($packages);
    }

    public function create_item( $request ) {
        global $wpdb;
        $p = $request->get_json_params();

        // 1. Simpan Paket Utama
        $data_pkg = [
            'name' => sanitize_text_field($p['name']),
            'category_id' => intval($p['category_id']),
            'airline_id' => intval($p['airline_id']),
            'departure_date' => $p['departure_date'],
            'duration_days' => intval($p['duration_days']),
            'quota' => intval($p['quota']),
            'status' => 'active',
            'itinerary_file' => esc_url_raw($p['itinerary_file']),
            'created_at' => current_time('mysql')
        ];
        
        $wpdb->insert($wpdb->prefix . 'umh_packages', $data_pkg);
        $package_id = $wpdb->insert_id;

        // 2. Simpan Varian Harga (Looping)
        if (!empty($p['pricing_variants']) && is_array($p['pricing_variants'])) {
            foreach ($p['pricing_variants'] as $price) {
                $wpdb->insert($wpdb->prefix . 'umh_package_prices', [
                    'package_id' => $package_id,
                    'room_type' => sanitize_text_field($price['type']),
                    'price' => floatval($price['price']),
                    'currency' => 'IDR'
                ]);
            }
        }

        // 3. Simpan Hotel (Looping)
        if (!empty($p['hotels']) && is_array($p['hotels'])) {
            foreach ($p['hotels'] as $hotel) {
                $wpdb->insert($wpdb->prefix . 'umh_package_hotels', [
                    'package_id' => $package_id,
                    'hotel_id' => intval($hotel['id']), // Asumsi FE kirim object hotel
                    'city' => sanitize_text_field($hotel['city']), // makkah/madinah
                    'duration_nights' => intval($hotel['nights'] ?? 0)
                ]);
            }
        }

        return rest_ensure_response(['id' => $package_id, 'message' => 'Paket berhasil dibuat dengan struktur relasional.']);
    }

    public function update_item( $request ) {
        global $wpdb;
        $id = $request['id'];
        $p = $request->get_json_params();

        // Update Parent
        $wpdb->update($wpdb->prefix . 'umh_packages', [
            'name' => $p['name'],
            'airline_id' => $p['airline_id'],
            'departure_date' => $p['departure_date'],
            'status' => $p['status']
        ], ['id' => $id]);

        // Reset & Re-insert Children (Cara paling aman untuk update one-to-many simple)
        // Hapus harga lama
        $wpdb->delete($wpdb->prefix . 'umh_package_prices', ['package_id' => $id]);
        // Insert harga baru
        if (!empty($p['pricing_variants'])) {
            foreach ($p['pricing_variants'] as $price) {
                $wpdb->insert($wpdb->prefix . 'umh_package_prices', [
                    'package_id' => $id,
                    'room_type' => $price['type'],
                    'price' => $price['price']
                ]);
            }
        }

        // Hapus hotel lama
        $wpdb->delete($wpdb->prefix . 'umh_package_hotels', ['package_id' => $id]);
        // Insert hotel baru
        if (!empty($p['hotels'])) {
            foreach ($p['hotels'] as $hotel) {
                $wpdb->insert($wpdb->prefix . 'umh_package_hotels', [
                    'package_id' => $id,
                    'hotel_id' => intval($hotel['id']),
                    'city' => $hotel['city']
                ]);
            }
        }

        return rest_ensure_response(['message' => 'Paket diperbarui']);
    }

    public function delete_item( $request ) {
        global $wpdb;
        $id = $request['id'];
        
        // Hapus dependencies dulu (Foreign key manual handling)
        $wpdb->delete($wpdb->prefix . 'umh_package_prices', ['package_id' => $id]);
        $wpdb->delete($wpdb->prefix . 'umh_package_hotels', ['package_id' => $id]);
        $wpdb->delete($wpdb->prefix . 'umh_packages', ['id' => $id]);
        
        return rest_ensure_response(['message' => 'Paket dihapus']);
    }
}
new UMH_API_Packages();