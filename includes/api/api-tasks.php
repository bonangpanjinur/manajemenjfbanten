<?php
if (!defined('ABSPATH')) exit;

class UMH_API_Tasks {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        $namespace = 'umh/v1';

        // GET Tasks (Filter by User ID)
        register_rest_route($namespace, '/tasks', [
            'methods' => 'GET',
            'callback' => array($this, 'get_tasks'),
            'permission_callback' => '__return_true'
        ]);

        // POST Create Task (Owner assign to staff)
        register_rest_route($namespace, '/tasks', [
            'methods' => 'POST',
            'callback' => array($this, 'create_task'),
            'permission_callback' => '__return_true'
        ]);

        // PUT Update Task Status (Staff update status)
        register_rest_route($namespace, '/tasks/(?P<id>\d+)', [
            'methods' => 'PUT',
            'callback' => array($this, 'update_task'),
            'permission_callback' => '__return_true'
        ]);

        // POST Work Report
        register_rest_route($namespace, '/reports', [
            'methods' => 'POST',
            'callback' => array($this, 'create_report'),
            'permission_callback' => '__return_true'
        ]);
    }

    public function get_tasks($request) {
        global $wpdb;
        $user_id = $request->get_param('user_id');
        
        $sql = "SELECT t.*, u.full_name as assignee_name 
                FROM {$wpdb->prefix}umh_tasks t 
                LEFT JOIN {$wpdb->prefix}umh_users u ON t.user_id = u.id";
        
        if ($user_id) {
            $sql .= $wpdb->prepare(" WHERE t.user_id = %d", $user_id);
        }
        
        $sql .= " ORDER BY t.created_at DESC";
        return $wpdb->get_results($sql);
    }

    public function create_task($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        $wpdb->insert($wpdb->prefix . 'umh_tasks', [
            'user_id' => $params['user_id'],
            'title' => sanitize_text_field($params['title']),
            'description' => sanitize_textarea_field($params['description']),
            'due_date' => $params['due_date'],
            'priority' => $params['priority'],
            'is_impromptu' => isset($params['is_impromptu']) ? 1 : 0,
            'created_by' => 1, // Default admin/owner ID
            'status' => 'pending'
        ]);
        return rest_ensure_response(['message' => 'Tugas berhasil diberikan.']);
    }

    public function update_task($request) {
        global $wpdb;
        $id = $request['id'];
        $params = $request->get_json_params();
        
        $wpdb->update($wpdb->prefix . 'umh_tasks', 
            ['status' => $params['status']], 
            ['id' => $id]
        );
        return rest_ensure_response(['message' => 'Status tugas diperbarui.']);
    }

    public function create_report($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        $wpdb->insert($wpdb->prefix . 'umh_work_reports', [
            'user_id' => $params['user_id'],
            'report_date' => date('Y-m-d'),
            'content' => sanitize_textarea_field($params['content'])
        ]);
        return rest_ensure_response(['message' => 'Laporan kerja terkirim.']);
    }
}
new UMH_API_Tasks();