<?php
defined('ABSPATH') || exit;

add_action('rest_api_init', function () {
    // Endpoint: Ambil Data Dashboard Jemaah
    register_rest_route('umh/v1', '/portal/dashboard', [
        'methods' => 'GET',
        'callback' => 'umh_get_portal_dashboard',
        'permission_callback' => function () {
            return is_user_logged_in(); // User harus login
        }
    ]);
});

function umh_get_portal_dashboard() {
    global $wpdb;
    $current_user_id = get_current_user_id();

    // Tabel
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $table_packages = $wpdb->prefix . 'umh_packages';
    $table_payments = $wpdb->prefix . 'umh_payments'; // Asumsi tabel pembayaran ada

    // 1. Cari Data Jemaah berdasarkan User ID (Asumsi ada kolom user_id di tabel jamaah yang melink ke WP User)
    // Jika tidak ada kolom user_id, kita cari berdasarkan email user login
    $current_user = wp_get_current_user();
    $user_email = $current_user->user_email;

    $jamaah = $wpdb->get_row($wpdb->prepare(
        "SELECT j.*, p.name as paket_name, p.itinerary, p.hotels, p.airline 
         FROM $table_jamaah j
         LEFT JOIN $table_packages p ON j.package_id = p.id
         WHERE j.email = %s OR j.user_id = %d",
        $user_email,
        $current_user_id
    ));

    if (!$jamaah) {
        return new WP_Error('not_found', 'Data jemaah tidak ditemukan. Hubungi admin.', ['status' => 404]);
    }

    // 2. Hitung Pembayaran
    $total_paid = 0;
    // Cek apakah tabel payments ada
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_payments'") == $table_payments) {
        $total_paid = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM $table_payments WHERE jamaah_id = %d AND status = 'verified'",
            $jamaah->id
        ));
    }

    $sisa_tagihan = $jamaah->total_price - $total_paid;
    $status_bayar = ($sisa_tagihan <= 0) ? 'Lunas' : 'Belum Lunas';

    // 3. Status Dokumen (Logika Sederhana)
    $documents = [
        'passport' => !empty($jamaah->passport_number),
        'visa' => ($jamaah->visa_status === 'issued'),
        'ticket' => ($jamaah->status === 'ticketing' || $jamaah->status === 'departed')
    ];

    // Decode JSON Itinerary & Hotels
    $itinerary = json_decode($jamaah->itinerary) ?: [];
    $hotels = json_decode($jamaah->hotels) ?: [];

    return rest_ensure_response([
        'success' => true,
        'data' => [
            'profile' => [
                'name' => $jamaah->full_name,
                'status_jamaah' => strtoupper(str_replace('_', ' ', $jamaah->status)),
                'group' => $jamaah->group_name ?? '-'
            ],
            'paket' => [
                'name' => $jamaah->paket_name,
                'departure_date' => $jamaah->departure_date,
                'airline' => $jamaah->airline,
                'hotels' => $hotels
            ],
            'payment' => [
                'total_price' => (float)$jamaah->total_price,
                'total_paid' => (float)$total_paid,
                'remaining' => (float)$sisa_tagihan,
                'status' => $status_bayar
            ],
            'documents' => $documents,
            'itinerary' => $itinerary
        ]
    ]);
}