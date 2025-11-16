<?php
// File: includes/api/api-packages.php
// Menggunakan CRUD Controller untuk mengelola Paket Umroh.
// (DIMODIFIKASI untuk skema tabel paket yang baru)

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. Definisikan Skema Data (cocokkan dengan db-schema.php VERSI 1.3)
$packages_schema = [
    'title' => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'slug' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'image' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'esc_url_raw'],
    'promo' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'hotel_ids_text' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'price_details' => ['type' => 'string', 'required' => false], // Akan di-handle sebagai JSON string
    'itinerary' => ['type' => 'string', 'required' => false], // Bisa jadi JSON string atau HTML
    'travel_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'tipe_paket' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'departure_city' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'duration' => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'period_start_month' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'period_end_month' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'period_year' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'meta_title' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'meta_description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'keywords' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'short_description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'faq_schema' => ['type' => 'string', 'required' => false], // JSON string
    'review_count' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'average_rating' => ['type' => 'number', 'required' => false],
    'canonical_url' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'esc_url_raw'],
    'currency' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'status' => ['type' => 'string', 'required' => false, 'default' => 'draft', 'enum' => ['draft', 'published', 'archived']],
    'slots_available' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'slots_filled' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'departure_date' => ['type' => 'string', 'format' => 'date', 'required' => false],
];

// 2. Definisikan Izin (Hanya Owner & Admin Staff yang bisa kelola paket)
$packages_permissions = [
    'get_items'    => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'], // Semua bisa lihat
    'get_item'     => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'], // Semua bisa lihat
    'create_item'  => ['owner', 'admin_staff'],
    'update_item'  => ['owner', 'admin_staff'],
    'delete_item'  => ['owner'],
];

// 3. Inisialisasi Controller
// Parameter: ('endpoint_base', 'slug_tabel_db', $skema, $izin)
new UMH_CRUD_Controller('packages', 'umh_packages', $packages_schema, $packages_permissions);