<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
    // GET List Staff
    register_rest_route('umh/v1', '/hr/staff', [
        'methods' => 'GET',
        'callback' => 'umh_get_staff_list',
        'permission_callback' => function() { return current_user_can('list_users'); }
    ]);

    // UPDATE Permission
    register_rest_route('umh/v1', '/hr/staff/(?P<id>\d+)/permissions', [
        'methods' => 'POST',
        'callback' => 'umh_update_staff_permissions',
        'permission_callback' => function() { return current_user_can('promote_users'); }
    ]);
});

function umh_get_staff_list() {
    global $wpdb;
    // Mengambil data dari tabel umh_hr join dengan wp_users
    $sql = "SELECT h.*, u.display_name as full_name, u.user_email 
            FROM {$wpdb->prefix}umh_hr h 
            JOIN {$wpdb->prefix}users u ON h.user_id = u.ID";
    return $wpdb->get_results($sql);
}

function umh_update_staff_permissions($request) {
    global $wpdb;
    $id = $request['id'];
    $params = $request->get_json_params();
    
    $permissions_json = json_encode($params['permissions']); // ['dashboard', 'finance', etc]

    $updated = $wpdb->update(
        $wpdb->prefix . 'umh_hr',
        ['permissions' => $permissions_json],
        ['id' => $id]
    );

    return ['success' => (bool)$updated];
}