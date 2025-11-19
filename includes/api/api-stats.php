<?php
/**
 * API Handler untuk Statistik Dashboard
 * Endpoint: /wp-json/umh/v1/stats/dashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_API_Stats {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $namespace = 'umh/v1';
        
        register_rest_route( $namespace, '/stats/dashboard', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_dashboard_stats' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    public function check_permission() {
        return is_user_logged_in(); // Semua user login bisa akses, nanti data difilter berdasarkan role
    }

    public function get_dashboard_stats( $request ) {
        global $wpdb;
        $user = wp_get_current_user();
        $is_admin_or_owner = in_array( 'administrator', (array) $user->roles ) || in_array( 'umh_owner', (array) $user->roles ); // Asumsi role owner

        $data = array(
            'cards' => array(),
            'chart' => array(),
            'upcoming' => array(),
            'alerts' => array()
        );

        // 1. STATISTIK KARTU UTAMA
        $tbl_jamaah = $wpdb->prefix . 'umh_jamaah';
        $tbl_finance = $wpdb->prefix . 'umh_cash_flow';
        $tbl_packages = $wpdb->prefix . 'umh_packages';

        // Total Jamaah Aktif (Belum berangkat atau baru pulang)
        $data['cards']['total_jamaah'] = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $tbl_jamaah" );
        
        // Jamaah Bulan Ini
        $current_month = date('Y-m');
        $data['cards']['new_jamaah_month'] = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $tbl_jamaah WHERE created_at LIKE %s", $current_month . '%' ) );

        // Sisa Kursi (Paket Aktif)
        // Ini logic sederhana, idealnya hitung kuota per paket dikurang jumlah jamaah
        $data['cards']['active_packages'] = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $tbl_packages WHERE status = 'active'" );

        // KHUSUS ADMIN/OWNER: Data Keuangan
        if ( $is_admin_or_owner ) {
            $in = $wpdb->get_var( "SELECT SUM(amount) FROM $tbl_finance WHERE type = 'in'" );
            $out = $wpdb->get_var( "SELECT SUM(amount) FROM $tbl_finance WHERE type = 'out'" );
            
            $data['cards']['revenue'] = (float) $in;
            $data['cards']['expense'] = (float) $out;
            $data['cards']['profit'] = (float) ($in - $out);
        }

        // 2. GRAFIK PENDAFTARAN JAMAAH (6 Bulan Terakhir)
        // Query Group By Month
        $chart_sql = "
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
            FROM $tbl_jamaah 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month 
            ORDER BY month ASC
        ";
        $chart_results = $wpdb->get_results( $chart_sql );
        
        // Format data untuk chart frontend
        $data['chart'] = $chart_results;

        // 3. KEBERANGKATAN TERDEKAT (Upcoming Departures)
        $upcoming_sql = "
            SELECT id, name, departure_date, airline_id, status 
            FROM $tbl_packages 
            WHERE departure_date >= CURDATE() AND status = 'active'
            ORDER BY departure_date ASC 
            LIMIT 5
        ";
        $upcoming_pkgs = $wpdb->get_results( $upcoming_sql );
        
        foreach($upcoming_pkgs as $pkg) {
            // Hitung jamaah per paket
            $pkg->jamaah_count = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $tbl_jamaah WHERE package_id = %d", $pkg->id ) );
            // Ambil nama maskapai
            $pkg->airline_name = $this->get_master_name($pkg->airline_id, 'airline');
        }
        $data['upcoming'] = $upcoming_pkgs;

        // 4. ALERT SYSTEM (Paspor Expired & Belum Lunas H-30)
        // Cek paspor expired dalam 6 bulan ke depan
        $passport_alert_sql = "
            SELECT id, full_name, passport_expiry_date, 'passport_warning' as type
            FROM $tbl_jamaah 
            WHERE passport_expiry_date IS NOT NULL 
            AND passport_expiry_date <= DATE_ADD(CURDATE(), INTERVAL 6 MONTH)
            AND passport_expiry_date >= CURDATE()
            LIMIT 5
        ";
        $data['alerts'] = $wpdb->get_results( $passport_alert_sql );

        return rest_ensure_response( $data );
    }

    private function get_master_name($id, $type) {
        global $wpdb;
        if(!$id) return '-';
        return $wpdb->get_var( $wpdb->prepare( "SELECT name FROM {$wpdb->prefix}umh_master_data WHERE id = %d AND type = %s", $id, $type ) ) ?: '-';
    }
}

new UMH_API_Stats();