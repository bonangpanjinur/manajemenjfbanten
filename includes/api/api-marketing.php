<?php
// File Location: includes/api/api-marketing.php

if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Marketing {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Saya asumsikan tabel leads belum dibuat di schema sebelumnya, 
        // jadi kita gunakan tabel custom sederhana atau meta user.
        // Untuk kelengkapan, idealnya ditambahkan tabel 'umh_leads' di db-schema.php
        // Namun di sini saya buatkan query standard ke tabel umh_leads (pastikan tabel ini ada).
        
        register_rest_route( 'umh/v1', '/leads', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_items' ),
            'permission_callback' => '__return_true',
        ) );
        register_rest_route( 'umh/v1', '/leads', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'create_item' ),
            'permission_callback' => '__return_true',
        ) );
    }

    // Catatan: Tambahkan tabel ini di db-schema.php jika belum ada:
    // CREATE TABLE umh_leads (id INT AUTO_INCREMENT, name VARCHAR(255), contact VARCHAR(50), source VARCHAR(50), status VARCHAR(50), PRIMARY KEY(id));

    public function get_items( $request ) {
        global $wpdb;
        // Cek tabel jika ada
        $table = $wpdb->prefix . 'umh_leads';
        
        // Fallback handling jika tabel belum dibuat (safety)
        if($wpdb->get_var("SHOW TABLES LIKE '$table'") != $table) {
             return rest_ensure_response([]);
        }

        $results = $wpdb->get_results("SELECT * FROM $table ORDER BY id DESC");
        return rest_ensure_response($results);
    }

    public function create_item( $request ) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_leads';

        // Auto create table if not exists (Quick fix helper)
        if($wpdb->get_var("SHOW TABLES LIKE '$table'") != $table) {
            $charset_collate = $wpdb->get_charset_collate();
            $sql = "CREATE TABLE $table (
                id bigint(20) NOT NULL AUTO_INCREMENT,
                name varchar(255) NOT NULL,
                contact varchar(100) NOT NULL,
                source varchar(50) DEFAULT NULL, -- ig, wa, fb
                status varchar(50) DEFAULT 'new', -- new, closing, lost
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY  (id)
            ) $charset_collate;";
            require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
            dbDelta( $sql );
        }

        $data = array(
            'name' => sanitize_text_field($params['name']),
            'contact' => sanitize_text_field($params['contact']),
            'source' => sanitize_text_field($params['source']),
            'status' => sanitize_text_field($params['status']),
            'created_at' => current_time('mysql')
        );

        $wpdb->insert($table, $data);
        return rest_ensure_response(array('message' => 'Lead saved'));
    }
}
new UMH_API_Marketing();