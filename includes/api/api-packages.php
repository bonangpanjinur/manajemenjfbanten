<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', 'umh_register_package_routes');

function umh_register_package_routes() {
    $controller = new UMH_Crud_Controller('umh_packages');
    $controller->register_routes();
    
    // Override create/update untuk handle JSON encoding
    register_rest_route('umh/v1', '/packages', [
        'methods' => 'POST',
        'callback' => 'umh_create_package_custom',
        'permission_callback' => function() { return current_user_can('edit_posts'); }
    ]);
}

function umh_create_package_custom($request) {
    global $wpdb;
    $p = $request->get_json_params();

    // Format Array ke JSON sebelum simpan ke DB
    $pricing_json = isset($p['pricing']) ? json_encode($p['pricing']) : '[]';
    $dates_json = isset($p['dates']) ? json_encode($p['dates']) : '[]';
    $airlines_json = isset($p['airlines']) ? json_encode($p['airlines']) : '[]';
    $hotels_json = isset($p['hotels']) ? json_encode($p['hotels']) : '[]';

    $data = [
        'name' => $p['name'],
        'duration_days' => $p['duration_days'],
        'total_seats' => $p['total_seats'],
        'available_seats' => $p['total_seats'], // Default sama dengan total
        'pricing_variants' => $pricing_json,
        'departure_dates' => $dates_json,
        'airline_ids' => $airlines_json,
        'hotel_ids' => $hotels_json,
        'status' => 'available'
    ];

    $format = ['%s', '%d', '%d', '%d', '%s', '%s', '%s', '%s', '%s'];

    $wpdb->insert($wpdb->prefix . 'umh_packages', $data, $format);
    return ['id' => $wpdb->insert_id];
}