<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Manifest {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Get Manifest Data per Package
        register_rest_route( 'umh/v1', '/manifest/(?P<package_id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_package_manifest'], 'permission_callback' => '__return_true'],
        ]);
        
        // Search Jamaah for Mahram selection
        register_rest_route( 'umh/v1', '/jamaah/search', [
            ['methods' => 'GET', 'callback' => [$this, 'search_jamaah'], 'permission_callback' => '__return_true'],
        ]);
    }

    public function get_package_manifest($request) {
        global $wpdb;
        $pkg_id = $request['package_id'];

        // 1. Get Package Details
        $package = $wpdb->get_row($wpdb->prepare(
            "SELECT p.*, a.name as airline_name, c.name as category_name 
             FROM {$wpdb->prefix}umh_packages p
             LEFT JOIN {$wpdb->prefix}umh_airlines a ON p.airline_id = a.id
             LEFT JOIN {$wpdb->prefix}umh_categories c ON p.category_id = c.id
             WHERE p.id = %d", $pkg_id
        ));

        if (!$package) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

        // 2. Get Jamaah List with Mahram & Room Info
        // Query ini menggabungkan Jamaah -> Mahram -> Booking -> Room -> Hotel
        $sql = "
            SELECT 
                j.id, j.full_name, j.passport_number, j.gender, j.birth_date, j.nik,
                m.full_name as mahram_name, j.relation,
                b.booking_code,
                r.room_number, r.room_type, h.name as hotel_name
            FROM {$wpdb->prefix}umh_jamaah j
            LEFT JOIN {$wpdb->prefix}umh_jamaah m ON j.mahram_id = m.id
            LEFT JOIN {$wpdb->prefix}umh_bookings b ON j.id = b.jamaah_id
            LEFT JOIN {$wpdb->prefix}umh_room_guests rg ON b.id = rg.booking_id
            LEFT JOIN {$wpdb->prefix}umh_rooms r ON rg.room_id = r.id
            LEFT JOIN {$wpdb->prefix}umh_package_hotels ph ON r.package_hotel_id = ph.id
            LEFT JOIN {$wpdb->prefix}umh_hotels h ON ph.hotel_id = h.id
            WHERE j.package_id = %d AND j.status != 'cancelled' AND j.status != 'deleted'
            ORDER BY j.full_name ASC
        ";

        $jamaah_list = $wpdb->get_results($wpdb->prepare($sql, $pkg_id));

        // Hitung Statistik
        $stats = [
            'total' => count($jamaah_list),
            'pria' => 0,
            'wanita' => 0,
            'dewasa' => 0, // > 12 th
            'anak' => 0,   // 2 - 12 th
            'bayi' => 0    // < 2 th
        ];

        foreach($jamaah_list as $j) {
            if($j->gender == 'L') $stats['pria']++; else $stats['wanita']++;
            
            // Hitung Umur sederhana
            if($j->birth_date) {
                $birthDate = new DateTime($j->birth_date);
                $today = new DateTime('today');
                $age = $birthDate->diff($today)->y;
                
                if($age < 2) $stats['bayi']++;
                elseif($age < 12) $stats['anak']++;
                else $stats['dewasa']++;
            } else {
                $stats['dewasa']++; // Default jika tgl lahir kosong
            }
        }

        return rest_ensure_response([
            'package' => $package,
            'stats' => $stats,
            'manifest' => $jamaah_list
        ]);
    }

    public function search_jamaah($request) {
        global $wpdb;
        $q = $request->get_param('q');
        if (empty($q)) return [];

        $sql = "SELECT id, full_name, passport_number FROM {$wpdb->prefix}umh_jamaah 
                WHERE (full_name LIKE %s OR passport_number LIKE %s) AND status != 'deleted' LIMIT 10";
        $term = '%' . $wpdb->esc_like($q) . '%';
        
        return $wpdb->get_results($wpdb->prepare($sql, $term, $term));
    }
}
new UMH_API_Manifest();