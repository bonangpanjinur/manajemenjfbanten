<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Users {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/users', [
            ['methods' => 'GET', 'callback' => [$this, 'get_users'], 'permission_callback' => '__return_true'], // Sebaiknya diproteksi di production
            ['methods' => 'POST', 'callback' => [$this, 'create_user'], 'permission_callback' => '__return_true'],
        ]);
        
        register_rest_route( 'umh/v1', '/users/(?P<id>\d+)', [
            ['methods' => 'PUT', 'callback' => [$this, 'update_user'], 'permission_callback' => '__return_true'],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_user'], 'permission_callback' => '__return_true'],
        ]);

        // Endpoint Login (Simulasi)
        register_rest_route( 'umh/v1', '/auth/login', [
            ['methods' => 'POST', 'callback' => [$this, 'login'], 'permission_callback' => '__return_true'],
        ]);
    }

    public function get_users($request) {
        global $wpdb;
        // Join untuk menampilkan nama Cabang/Agen terkait
        $sql = "SELECT u.*, b.name as branch_name, a.name as agent_name 
                FROM {$wpdb->prefix}umh_users u
                LEFT JOIN {$wpdb->prefix}umh_branches b ON u.linked_branch_id = b.id
                LEFT JOIN {$wpdb->prefix}umh_sub_agents a ON u.linked_agent_id = a.id
                WHERE u.status != 'deleted' ORDER BY u.created_at DESC";
        return $wpdb->get_results($sql);
    }

    public function create_user($request) {
        global $wpdb;
        $p = $request->get_json_params();

        // Basic Validation
        if(empty($p['email']) || empty($p['password'])) {
            return new WP_Error('invalid_data', 'Email dan Password wajib diisi', ['status' => 400]);
        }

        // Cek Email Duplicate
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_users WHERE email = %s", $p['email']));
        if($exists) return new WP_Error('duplicate_email', 'Email sudah terdaftar', ['status' => 400]);

        // Logic Role Mapping
        $linked_agent_id = 0;
        $linked_branch_id = 0;

        if ($p['role'] === 'agent') {
            $linked_agent_id = isset($p['linked_agent_id']) ? intval($p['linked_agent_id']) : 0;
        }
        if ($p['role'] === 'branch_manager') {
            $linked_branch_id = isset($p['linked_branch_id']) ? intval($p['linked_branch_id']) : 0;
        }

        $data = [
            'email' => $p['email'],
            'password_hash' => wp_hash_password($p['password']),
            'full_name' => $p['full_name'],
            'role' => $p['role'],
            'phone' => $p['phone'] ?? '',
            'linked_agent_id' => $linked_agent_id,
            'linked_branch_id' => $linked_branch_id,
            'status' => 'active'
        ];

        $wpdb->insert("{$wpdb->prefix}umh_users", $data);
        return ['success' => true, 'id' => $wpdb->insert_id];
    }

    public function update_user($request) {
        global $wpdb;
        $id = $request['id'];
        $p = $request->get_json_params();

        $data = [
            'full_name' => $p['full_name'],
            'role' => $p['role'],
            'phone' => $p['phone'],
            'status' => $p['status'],
            'linked_agent_id' => ($p['role'] === 'agent') ? intval($p['linked_agent_id']) : 0,
            'linked_branch_id' => ($p['role'] === 'branch_manager') ? intval($p['linked_branch_id']) : 0,
            'updated_at' => current_time('mysql')
        ];

        if (!empty($p['password'])) {
            $data['password_hash'] = wp_hash_password($p['password']);
        }

        $wpdb->update("{$wpdb->prefix}umh_users", $data, ['id' => $id]);
        return ['success' => true];
    }

    public function delete_user($request) {
        global $wpdb;
        $id = $request['id'];
        $wpdb->update("{$wpdb->prefix}umh_users", ['status' => 'deleted'], ['id' => $id]);
        return ['success' => true];
    }

    // Simple Login Logic
    public function login($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $email = $p['email'];
        $password = $p['password'];

        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_users WHERE email = %s AND status = 'active'", $email));

        if ($user && wp_check_password($password, $user->password_hash)) {
            // Generate Token (Simple)
            $token = md5(uniqid(rand(), true));
            $wpdb->update("{$wpdb->prefix}umh_users", 
                ['auth_token' => $token, 'token_expires' => date('Y-m-d H:i:s', strtotime('+1 day'))], 
                ['id' => $user->id]
            );

            return [
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    // Kirim ID terkait agar Frontend bisa filter menu
                    'linked_agent_id' => $user->linked_agent_id, 
                    'linked_branch_id' => $user->linked_branch_id
                ]
            ];
        }

        return new WP_Error('invalid_login', 'Email atau password salah', ['status' => 401]);
    }
}
new UMH_API_Users();