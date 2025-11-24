<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Jamaah {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/jamaah', [
            ['methods' => 'GET', 'callback' => [$this, 'get_jamaah'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_jamaah'], 'permission_callback' => '__return_true'],
        ]);
        
        register_rest_route( 'umh/v1', '/jamaah/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_jamaah_detail'], 'permission_callback' => '__return_true'],
            ['methods' => 'PUT', 'callback' => [$this, 'update_jamaah'], 'permission_callback' => '__return_true'],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_jamaah'], 'permission_callback' => '__return_true'],
        ]);
    }

    /**
     * Helper: Get Current User Scope
     * Membaca Header X-Umh-User-Id yang dikirim Frontend untuk menentukan role & filter
     */
    private function get_user_scope($request) {
        global $wpdb;
        $user_id = $request->get_header('X-Umh-User-Id');
        
        if(!$user_id) return null; // No user context

        $user = $wpdb->get_row($wpdb->prepare("SELECT role, linked_agent_id, linked_branch_id FROM {$wpdb->prefix}umh_users WHERE id = %d", $user_id));
        return $user;
    }

    public function get_jamaah($request) {
        global $wpdb;
        
        // 1. Start Query
        $sql = "SELECT j.*, p.name as package_name, p.departure_date, b.name as branch_name 
                FROM {$wpdb->prefix}umh_jamaah j
                LEFT JOIN {$wpdb->prefix}umh_packages p ON j.package_id = p.id
                LEFT JOIN {$wpdb->prefix}umh_branches b ON j.branch_id = b.id
                WHERE j.status != 'deleted'";

        // 2. ACCESS CONTROL (Filter berdasarkan Role)
        $user = $this->get_user_scope($request);
        if ($user) {
            if ($user->role === 'agent') {
                // Agen cuma boleh lihat jemaah yang dia referensikan
                $sql .= $wpdb->prepare(" AND j.sub_agent_id = %d", $user->linked_agent_id);
            } 
            elseif ($user->role === 'branch_manager') {
                // Kacab cuma boleh lihat jemaah di cabangnya
                $sql .= $wpdb->prepare(" AND j.branch_id = %d", $user->linked_branch_id);
            }
            // Super Admin & Owner lolos (tidak ada tambahan WHERE)
        }

        // 3. Standard Search Filters
        $search = $request->get_param('search');
        if($search) {
            $term = '%' . $wpdb->esc_like($search) . '%';
            $sql .= $wpdb->prepare(" AND (j.full_name LIKE %s OR j.passport_number LIKE %s)", $term, $term);
        }

        $sql .= " ORDER BY j.created_at DESC LIMIT 100";

        return $wpdb->get_results($sql);
    }

    public function create_jamaah($request) {
        global $wpdb;
        $data = $request->get_json_params();

        // ACCESS CONTROL: Auto-fill branch/agent jika yang input bukan admin
        $user = $this->get_user_scope($request);
        if ($user) {
            if ($user->role === 'agent') {
                $data['sub_agent_id'] = $user->linked_agent_id; // Paksa isi ID agen dia
            }
            if ($user->role === 'branch_manager') {
                $data['branch_id'] = $user->linked_branch_id; // Paksa isi ID cabang dia
            }
        }

        // ... (Validasi input standar) ...

        $wpdb->insert("{$wpdb->prefix}umh_jamaah", [
            'full_name' => $data['full_name'],
            'nik' => $data['nik'],
            'gender' => $data['gender'],
            'phone_number' => $data['phone_number'],
            'package_id' => $data['package_id'],
            'branch_id' => $data['branch_id'], // Akan terisi otomatis dari logic di atas atau input admin
            'sub_agent_id' => $data['sub_agent_id'],
            'status' => 'registered',
            'mahram_id' => isset($data['mahram_id']) ? $data['mahram_id'] : 0,
            'relation' => isset($data['relation']) ? $data['relation'] : '',
            // ... field lain ...
        ]);

        return ['success' => true, 'id' => $wpdb->insert_id];
    }

    public function get_jamaah_detail($request) {
        global $wpdb;
        $id = $request['id'];
        
        // Cek permission di sini juga jika perlu extra strict
        
        $sql = "SELECT * FROM {$wpdb->prefix}umh_jamaah WHERE id = %d";
        return $wpdb->get_row($wpdb->prepare($sql, $id));
    }

    public function update_jamaah($request) {
        global $wpdb;
        $id = $request['id'];
        $data = $request->get_json_params();
        
        // Sanitasi data sebelum update
        $updateData = [];
        $fields = ['full_name', 'passport_number', 'phone_number', 'address_details', 'status', 'package_id', 'mahram_id', 'relation'];
        
        foreach($fields as $f) {
            if(isset($data[$f])) $updateData[$f] = $data[$f];
        }

        $wpdb->update("{$wpdb->prefix}umh_jamaah", $updateData, ['id' => $id]);
        return ['success' => true];
    }

    public function delete_jamaah($request) {
        global $wpdb;
        $id = $request['id'];
        $wpdb->update("{$wpdb->prefix}umh_jamaah", ['status' => 'deleted'], ['id' => $id]);
        return ['success' => true];
    }
}
new UMH_API_Jamaah();