<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Print {
    public function __construct() {
        // Hook untuk menangani request cetak via URL admin-post.php
        // URL: /wp-admin/admin-post.php?action=umh_print_receipt&id=123
        add_action( 'admin_post_umh_print_receipt', array( $this, 'handle_print_receipt' ) );
        add_action( 'admin_post_umh_print_registration', array( $this, 'handle_print_registration' ) );
    }

    // --- HANDLER KWITANSI ---
    public function handle_print_receipt() {
        if ( ! current_user_can( 'read' ) ) wp_die( 'Anda tidak memiliki izin untuk mencetak.' );
        
        global $wpdb;
        $payment_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        // Ambil Data Pembayaran + Booking + Jamaah
        $payment = $wpdb->get_row($wpdb->prepare("
            SELECT pay.*, b.booking_code, j.full_name, p.name as package_name
            FROM {$wpdb->prefix}umh_payments pay
            JOIN {$wpdb->prefix}umh_bookings b ON pay.booking_id = b.id
            JOIN {$wpdb->prefix}umh_jamaah j ON b.jamaah_id = j.id
            LEFT JOIN {$wpdb->prefix}umh_packages p ON b.package_id = p.id
            WHERE pay.id = %d
        ", $payment_id));

        if (!$payment) wp_die('Data pembayaran tidak ditemukan.');

        // PERBAIKAN: Gunakan UMH_PLUGIN_DIR yang benar
        include UMH_PLUGIN_DIR . 'admin/print-receipt.php';
        exit;
    }

    // --- HANDLER FORMULIR PENDAFTARAN ---
    public function handle_print_registration() {
        if ( ! current_user_can( 'read' ) ) wp_die( 'Anda tidak memiliki izin untuk mencetak.' );

        global $wpdb;
        $booking_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        // Ambil Data Lengkap Booking
        $data = $wpdb->get_row($wpdb->prepare("
            SELECT b.*, j.*, p.name as package_name, p.departure_date, a.name as airline_name
            FROM {$wpdb->prefix}umh_bookings b
            JOIN {$wpdb->prefix}umh_jamaah j ON b.jamaah_id = j.id
            LEFT JOIN {$wpdb->prefix}umh_packages p ON b.package_id = p.id
            LEFT JOIN {$wpdb->prefix}umh_airlines a ON p.airline_id = a.id
            WHERE b.id = %d
        ", $booking_id));

        if (!$data) wp_die('Data pendaftaran tidak ditemukan.');

        // Decode JSON address jika ada
        $data->address_details = json_decode($data->address_details, true);

        // PERBAIKAN: Gunakan UMH_PLUGIN_DIR yang benar
        include UMH_PLUGIN_DIR . 'admin/print-registration.php';
        exit; 
    }
}
new UMH_API_Print();