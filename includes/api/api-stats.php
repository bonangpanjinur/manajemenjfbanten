<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Stats {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'umh/v1', '/stats/dashboard', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_dashboard_stats' ),
            'permission_callback' => function() { return is_user_logged_in(); }
        ) );
    }

    public function get_dashboard_stats( $request ) {
        global $wpdb;
        
        // Data Cards
        $jamaah_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah");
        $new_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE MONTH(created_at) = MONTH(CURRENT_DATE())");
        $income = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_cash_flow WHERE type='in'");
        $expense = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_cash_flow WHERE type='out'");
        
        // Chart Data (6 Bulan Terakhir)
        $chart_data = $wpdb->get_results("
            SELECT DATE_FORMAT(created_at, '%M') as month, COUNT(*) as count 
            FROM {$wpdb->prefix}umh_jamaah 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY MONTH(created_at) ORDER BY created_at ASC
        ");

        // Upcoming Departures
        $upcoming = $wpdb->get_results("
            SELECT p.name, p.departure_date, 
            (SELECT name FROM {$wpdb->prefix}umh_master_data WHERE id = p.airline_id) as airline_name,
            (SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE package_id = p.id) as jamaah_count
            FROM {$wpdb->prefix}umh_packages p
            WHERE p.departure_date >= CURDATE() AND p.status = 'active'
            ORDER BY p.departure_date ASC LIMIT 5
        ");

        // Poin 10: Tasks untuk User yang sedang login
        $current_user_id = get_current_user_id();
        // Cari employee_id dari wp_user_id
        $employee = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_employees WHERE wp_user_id = %d", $current_user_id));
        
        $my_tasks = [];
        if ($employee) {
            $my_tasks = $wpdb->get_results($wpdb->prepare("
                SELECT * FROM {$wpdb->prefix}umh_tasks 
                WHERE employee_id = %d AND status != 'completed'
                ORDER BY due_date ASC
            ", $employee->id));
        }

        return rest_ensure_response(array(
            'cards' => array(
                'total_jamaah' => (int)$jamaah_count,
                'new_jamaah_month' => (int)$new_jamaah,
                'revenue' => (float)$income,
                'profit' => (float)$income - (float)$expense,
                'expense' => (float)$expense,
                'active_packages' => count($upcoming)
            ),
            'chart' => $chart_data,
            'upcoming' => $upcoming,
            'my_tasks' => $my_tasks
        ));
    }
}
new UMH_API_Stats();