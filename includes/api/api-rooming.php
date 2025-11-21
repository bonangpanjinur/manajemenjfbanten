<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Rooming {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Ambil Data Rooming berdasarkan ID Hotel di Paket
        register_rest_route( 'umh/v1', '/rooming/(?P<package_hotel_id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_rooming'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'save_room'], 'permission_callback' => '__return_true'],
        ]);
        
        // Hapus Kamar
        register_rest_route( 'umh/v1', '/rooming/room/(?P<id>\d+)', [
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_room'], 'permission_callback' => '__return_true'],
        ]);
    }

    public function get_rooming($request) {
        global $wpdb;
        $ph_id = $request['package_hotel_id'];

        // 1. Ambil Info Hotel & Paket
        $hotel_info = $wpdb->get_row($wpdb->prepare("
            SELECT ph.*, h.name as hotel_name, h.city, p.name as package_name, p.id as package_id
            FROM {$wpdb->prefix}umh_package_hotels ph
            JOIN {$wpdb->prefix}umh_hotels h ON ph.hotel_id = h.id
            JOIN {$wpdb->prefix}umh_packages p ON ph.package_id = p.id
            WHERE ph.id = %d
        ", $ph_id));

        if (!$hotel_info) return new WP_Error('not_found', 'Data Hotel Paket tidak ditemukan', ['status' => 404]);

        // 2. Ambil Daftar Kamar yang SUDAH dibuat
        $rooms = $wpdb->get_results($wpdb->prepare("
            SELECT * FROM {$wpdb->prefix}umh_rooms WHERE package_hotel_id = %d ORDER BY room_number ASC
        ", $ph_id));

        // Isi detail penghuni tiap kamar
        foreach($rooms as $room) {
            $room->guests = $wpdb->get_results($wpdb->prepare("
                SELECT rg.id as guest_id, b.id as booking_id, j.full_name, j.gender, b.booking_code
                FROM {$wpdb->prefix}umh_room_guests rg
                JOIN {$wpdb->prefix}umh_bookings b ON rg.booking_id = b.id
                JOIN {$wpdb->prefix}umh_jamaah j ON b.jamaah_id = j.id
                WHERE rg.room_id = %d
            ", $room->id));
        }

        // 3. Ambil Jamaah yang BELUM dapat kamar (Unassigned)
        // Logika: Ambil semua jamaah di paket ini, KECUALI yang ID-nya sudah ada di tabel umh_room_guests hotel ini
        $assigned_booking_ids = $wpdb->get_col($wpdb->prepare("
            SELECT rg.booking_id 
            FROM {$wpdb->prefix}umh_room_guests rg
            JOIN {$wpdb->prefix}umh_rooms r ON rg.room_id = r.id
            WHERE r.package_hotel_id = %d
        ", $ph_id));
        
        // Trik agar SQL NOT IN tidak error jika array kosong
        $assigned_ids_str = empty($assigned_booking_ids) ? '0' : implode(',', array_map('intval', $assigned_booking_ids));

        $unassigned_jamaah = $wpdb->get_results($wpdb->prepare("
            SELECT b.id as booking_id, j.full_name, j.gender, b.selected_room_type
            FROM {$wpdb->prefix}umh_bookings b
            JOIN {$wpdb->prefix}umh_jamaah j ON b.jamaah_id = j.id
            WHERE b.package_id = %d 
            AND b.status != 'cancelled'
            AND b.id NOT IN ($assigned_ids_str)
            ORDER BY j.gender, j.full_name
        ", $hotel_info->package_id));

        return rest_ensure_response([
            'info' => $hotel_info,
            'rooms' => $rooms,
            'unassigned' => $unassigned_jamaah
        ]);
    }

    public function save_room($request) {
        global $wpdb;
        $ph_id = $request['package_hotel_id'];
        $p = $request->get_json_params();
        
        $wpdb->query('START TRANSACTION');
        try {
            // 1. Simpan Header Kamar
            $wpdb->insert($wpdb->prefix . 'umh_rooms', [
                'package_hotel_id' => $ph_id,
                'room_number' => sanitize_text_field($p['room_number']),
                'room_type' => sanitize_text_field($p['room_type']), // Quad/Triple/Double
                'notes' => sanitize_textarea_field($p['notes'] ?? '')
            ]);
            $room_id = $wpdb->insert_id;
            if(!$room_id) throw new Exception("Gagal membuat kamar");

            // 2. Masukkan Penghuni
            if (!empty($p['booking_ids']) && is_array($p['booking_ids'])) {
                foreach ($p['booking_ids'] as $bid) {
                    $wpdb->insert($wpdb->prefix . 'umh_room_guests', [
                        'room_id' => $room_id,
                        'booking_id' => intval($bid)
                    ]);
                }
            }
            $wpdb->query('COMMIT');
            return rest_ensure_response(['message' => 'Kamar berhasil dibuat', 'room_id' => $room_id]);

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('db_error', $e->getMessage(), ['status' => 500]);
        }
    }

    public function delete_room($request) {
        global $wpdb;
        $id = $request['id'];
        
        // Hapus tamu dulu, baru kamarnya
        $wpdb->delete($wpdb->prefix . 'umh_room_guests', ['room_id' => $id]);
        $wpdb->delete($wpdb->prefix . 'umh_rooms', ['id' => $id]);
        
        return rest_ensure_response(['message' => 'Kamar dihapus']);
    }
}
new UMH_API_Rooming();