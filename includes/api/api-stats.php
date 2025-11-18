<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_Stats_Controller extends WP_REST_Controller {

    public function register_routes() {
        $namespace = 'umh/v1';
        $base = 'stats';

        register_rest_route($namespace, '/' . $base, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_dashboard_stats'),
                'permission_callback' => array($this, 'get_stats_permissions_check'),
            ),
        ));
    }

    public function get_stats_permissions_check($request) {
        // Gunakan helper permission yang sudah kita buat
        return umh_check_api_permission($request);
    }

    public function get_dashboard_stats($request) {
        global $wpdb;

        // 1. Total Jamaah
        $total_jamaah = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}umh_jamaah");

        // 2. Total Omzet (Total Price semua jamaah, bukan yg paid)
        // Atau bisa ambil dari tabel finance 'income'
        $total_revenue = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_jamaah_payments WHERE status = 'paid'");

        // 3. Paket Aktif
        $active_packages = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}umh_packages WHERE status = 'available'");

        // 4. Jamaah Bulan Ini
        $current_month = date('Y-m');
        $new_leads = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM {$wpdb->prefix}umh_jamaah WHERE created_at LIKE %s",
            $current_month . '%'
        ));

        // 5. Recent Logs
        $recent_logs = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_logs ORDER BY timestamp DESC LIMIT 5");

        $data = array(
            'total_jamaah' => (int) $total_jamaah,
            'total_revenue' => (float) $total_revenue,
            'active_packages' => (int) $active_packages,
            'new_leads' => (int) $new_leads,
            'recent_logs' => $recent_logs
        );

        return new WP_REST_Response($data, 200);
    }
}