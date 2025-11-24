<?php
defined('ABSPATH') || exit;

add_action('rest_api_init', function () {
    // 1. Stats Dashboard Agen
    register_rest_route('umh/v1', '/agent/dashboard-stats', [
        'methods' => 'GET',
        'callback' => 'umh_get_agent_stats',
        'permission_callback' => function () {
            return is_user_logged_in(); 
        }
    ]);

    // 2. Daftar Leads Terbaru Agen
    register_rest_route('umh/v1', '/agent/recent-leads', [
        'methods' => 'GET',
        'callback' => 'umh_get_agent_leads',
        'permission_callback' => function () {
            return is_user_logged_in();
        }
    ]);
});

function umh_get_agent_stats() {
    global $wpdb;
    $current_user_id = get_current_user_id();
    
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $table_commissions = $wpdb->prefix . 'umh_commissions'; 

    // Cek tabel komisi
    $has_comm_table = $wpdb->get_var("SHOW TABLES LIKE '$table_commissions'") == $table_commissions;

    // Hitung Total Jamaah
    $total_jamaah = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(id) FROM $table_jamaah WHERE agent_id = %d AND status IN ('booked', 'paid', 'visa_processing', 'departed')",
        $current_user_id
    ));

    // Hitung Leads
    $potential_leads = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(id) FROM $table_jamaah WHERE agent_id = %d AND status IN ('new', 'prospect', 'follow_up')",
        $current_user_id
    ));

    // Hitung Komisi
    $komisi_cair = 0;
    $komisi_pending = 0;

    if ($has_comm_table) {
        $komisi_cair = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM $table_commissions WHERE user_id = %d AND status = 'paid'",
            $current_user_id
        ));

        $komisi_pending = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM $table_commissions WHERE user_id = %d AND status = 'pending'",
            $current_user_id
        ));
    }

    return rest_ensure_response([
        'success' => true,
        'data' => [
            'totalJamaah' => (int)$total_jamaah,
            'potensiLeads' => (int)$potential_leads,
            'komisiCair' => (float)$komisi_cair,
            'komisiPending' => (float)$komisi_pending
        ]
    ]);
}

function umh_get_agent_leads() {
    global $wpdb;
    $current_user_id = get_current_user_id();
    
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $table_packages = $wpdb->prefix . 'umh_packages';

    $query = $wpdb->prepare(
        "SELECT j.id, j.full_name as name, j.status, j.created_at as date, p.name as paket_name
         FROM $table_jamaah j
         LEFT JOIN $table_packages p ON j.package_id = p.id
         WHERE j.agent_id = %d
         ORDER BY j.created_at DESC LIMIT 10",
        $current_user_id
    );

    $leads = $wpdb->get_results($query);

    return rest_ensure_response([
        'success' => true,
        'data' => $leads
    ]);
}