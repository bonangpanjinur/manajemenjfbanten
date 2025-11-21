<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_MasterData {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Hotels
        register_rest_route( 'umh/v1', '/hotels', [
            ['methods' => 'GET', 'callback' => [$this, 'get_hotels'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_hotel'], 'permission_callback' => '__return_true']
        ]);
        // Airlines
        register_rest_route( 'umh/v1', '/airlines', [
            ['methods' => 'GET', 'callback' => [$this, 'get_airlines'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_airline'], 'permission_callback' => '__return_true']
        ]);
        // Categories (DITAMBAHKAN)
        register_rest_route( 'umh/v1', '/categories', [
             ['methods' => 'GET', 'callback' => [$this, 'get_categories'], 'permission_callback' => '__return_true'],
             ['methods' => 'POST', 'callback' => [$this, 'create_category'], 'permission_callback' => '__return_true']
        ]);
        // Route Delete Global untuk Master Data (biar hemat route)
        register_rest_route( 'umh/v1', '/master/(?P<type>[a-zA-Z0-9-]+)/(?P<id>\d+)', [
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true']
        ]);
    }

    // --- HOTELS ---
    public function get_hotels() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_hotels ORDER BY name");
    }
    public function create_hotel($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $wpdb->insert($wpdb->prefix.'umh_hotels', [
            'name' => sanitize_text_field($p['name']),
            'city' => sanitize_text_field($p['city']),
            'star_rating' => intval($p['star_rating']),
            'distance_to_haram' => intval($p['distance_to_haram'])
        ]);
        return rest_ensure_response(['id' => $wpdb->insert_id]);
    }

    // --- AIRLINES ---
    public function get_airlines() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_airlines ORDER BY name");
    }
    public function create_airline($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $wpdb->insert($wpdb->prefix.'umh_airlines', [
            'name' => sanitize_text_field($p['name']),
            'code' => strtoupper(sanitize_text_field($p['code']))
        ]);
        return rest_ensure_response(['id' => $wpdb->insert_id]);
    }

    // --- CATEGORIES (BARU) ---
    public function get_categories() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_categories ORDER BY name");
    }
    public function create_category($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $name = sanitize_text_field($p['name']);
        $slug = sanitize_title($name); // Auto generate slug dari nama
        
        $wpdb->insert($wpdb->prefix.'umh_categories', [
            'name' => $name,
            'slug' => $slug
        ]);
        return rest_ensure_response(['id' => $wpdb->insert_id]);
    }

    // --- GLOBAL DELETE ---
    public function delete_item($request) {
        global $wpdb;
        $type = $request['type']; // hotels, airlines, categories
        $id = $request['id'];
        
        $table_map = [
            'hotels' => 'umh_hotels',
            'airlines' => 'umh_airlines',
            'categories' => 'umh_categories'
        ];

        if (!isset($table_map[$type])) return new WP_Error('invalid_type', 'Tipe data tidak valid', ['status' => 400]);

        $table = $wpdb->prefix . $table_map[$type];
        $wpdb->delete($table, ['id' => $id]);
        
        return rest_ensure_response(['message' => 'Item deleted']);
    }
}
new UMH_API_MasterData();