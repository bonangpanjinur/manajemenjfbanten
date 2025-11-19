<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', 'umh_register_master_routes');

function umh_register_master_routes() {
    $namespace = 'umh/v1';

    // Airlines
    register_rest_route($namespace, '/airlines', [
        ['methods' => 'GET', 'callback' => 'umh_get_airlines', 'permission_callback' => '__return_true'],
        ['methods' => 'POST', 'callback' => 'umh_create_airline', 'permission_callback' => function() { return current_user_can('edit_posts'); }]
    ]);
    register_rest_route($namespace, '/airlines/(?P<id>\d+)', [
        ['methods' => 'DELETE', 'callback' => 'umh_delete_airline', 'permission_callback' => function() { return current_user_can('edit_posts'); }]
    ]);

    // Hotels
    register_rest_route($namespace, '/hotels', [
        ['methods' => 'GET', 'callback' => 'umh_get_hotels', 'permission_callback' => '__return_true'],
        ['methods' => 'POST', 'callback' => 'umh_create_hotel', 'permission_callback' => function() { return current_user_can('edit_posts'); }]
    ]);
    register_rest_route($namespace, '/hotels/(?P<id>\d+)', [
        ['methods' => 'DELETE', 'callback' => 'umh_delete_hotel', 'permission_callback' => function() { return current_user_can('edit_posts'); }]
    ]);
}

// --- Airlines Callbacks ---
function umh_get_airlines() {
    global $wpdb;
    return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_airlines ORDER BY name ASC");
}

function umh_create_airline($request) {
    global $wpdb;
    $p = $request->get_json_params();
    $wpdb->insert($wpdb->prefix . 'umh_airlines', ['name' => $p['name'], 'logo_url' => $p['logo_url']]);
    return ['id' => $wpdb->insert_id];
}

function umh_delete_airline($request) {
    global $wpdb;
    $wpdb->delete($wpdb->prefix . 'umh_airlines', ['id' => $request['id']]);
    return ['success' => true];
}

// --- Hotels Callbacks ---
function umh_get_hotels() {
    global $wpdb;
    return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_hotels ORDER BY name ASC");
}

function umh_create_hotel($request) {
    global $wpdb;
    $p = $request->get_json_params();
    $wpdb->insert($wpdb->prefix . 'umh_hotels', [
        'name' => $p['name'],
        'star_rating' => $p['star_rating'],
        'city' => $p['city'],
        'map_link' => $p['map_link'],
        'photo_url' => $p['photo_url']
    ]);
    return ['id' => $wpdb->insert_id];
}

function umh_delete_hotel($request) {
    global $wpdb;
    $wpdb->delete($wpdb->prefix . 'umh_hotels', ['id' => $request['id']]);
    return ['success' => true];
}