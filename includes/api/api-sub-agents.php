<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Sub_Agents {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/sub-agents', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true']
        ]);
        register_rest_route( 'umh/v1', '/sub-agents/(?P<id>\d+)', [
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_items() {
        global $wpdb;
        $results = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}umh_sub_agents ORDER BY name ASC" );
        return rest_ensure_response( $results );
    }

    public function create_item( $request ) {
        global $wpdb;
        $p = $request->get_json_params();

        $data = [
            'name' => sanitize_text_field($p['name']),
            'phone' => sanitize_text_field($p['phone']),
            'email' => sanitize_email($p['email']),
            'status' => sanitize_text_field($p['status']) ?: 'active'
        ];

        if ( !empty($p['id']) ) {
            $wpdb->update( $wpdb->prefix . 'umh_sub_agents', $data, ['id' => $p['id']] );
            return rest_ensure_response( ['message' => 'Agen diperbarui'] );
        } else {
            $data['created_at'] = current_time('mysql');
            $wpdb->insert( $wpdb->prefix . 'umh_sub_agents', $data );
            return rest_ensure_response( ['message' => 'Agen ditambahkan', 'id' => $wpdb->insert_id] );
        }
    }

    public function delete_item( $request ) {
        global $wpdb;
        $id = $request['id'];
        // Cek apakah agen punya jemaah?
        $count = $wpdb->get_var( $wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE sub_agent_id = %d", $id) );
        
        if ( $count > 0 ) {
            return new WP_Error('cant_delete', 'Agen ini memiliki jemaah terdaftar. Tidak bisa dihapus.', ['status' => 400]);
        }

        $wpdb->delete( $wpdb->prefix . 'umh_sub_agents', ['id' => $id] );
        return rest_ensure_response( ['message' => 'Agen dihapus'] );
    }
}
new UMH_API_Sub_Agents();