<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_SubAgents {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/sub-agents', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true']
        ]);
        register_rest_route( 'umh/v1', '/sub-agents/(?P<id>\d+)', [
            ['methods' => 'PUT', 'callback' => [$this, 'update_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_items() {
        global $wpdb;
        $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_sub_agents ORDER BY name ASC");
        foreach($results as $row) {
            $row->address_details = json_decode($row->address_details);
        }
        return rest_ensure_response($results);
    }

    public function create_item($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $data = [
            'name' => sanitize_text_field($p['name']),
            'phone' => sanitize_text_field($p['phone']),
            'email' => sanitize_email($p['email']),
            'address_details' => json_encode($p['address_details'] ?? []),
            'join_date' => $p['join_date'] ?: current_time('Y-m-d'),
            'status' => $p['status'] ?: 'active'
        ];
        $wpdb->insert($wpdb->prefix.'umh_sub_agents', $data);
        return rest_ensure_response(['message' => 'Sub Agent created']);
    }

    public function update_item($request) {
        global $wpdb;
        $id = $request['id'];
        $p = $request->get_json_params();
        $data = [
            'name' => sanitize_text_field($p['name']),
            'phone' => sanitize_text_field($p['phone']),
            'email' => sanitize_email($p['email']),
            'address_details' => json_encode($p['address_details'] ?? []),
            'status' => $p['status']
        ];
        $wpdb->update($wpdb->prefix.'umh_sub_agents', $data, ['id' => $id]);
        return rest_ensure_response(['message' => 'Sub Agent updated']);
    }

    public function delete_item($request) {
        global $wpdb;
        $wpdb->delete($wpdb->prefix.'umh_sub_agents', ['id' => $request['id']]);
        return rest_ensure_response(['message' => 'Sub Agent deleted']);
    }
}
new UMH_API_SubAgents();