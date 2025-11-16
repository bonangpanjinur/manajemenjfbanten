<?php
// File: includes/api/api-hotels.php
// Menggunakan CRUD Controller untuk mengelola Hotel.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. Definisikan Skema Data
$hotels_schema = [
    'name'    => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'address' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'city'    => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'country' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'phone'   => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'email'   => ['type' => 'string', 'format' => 'email', 'required' => false, 'sanitize_callback' => 'sanitize_email'],
    'rating'  => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
];

// 2. Definisikan Izin
$hotels_permissions = [
    'get_items'    => ['owner', 'admin_staff'],
    'get_item'     => ['owner', 'admin_staff'],
    'create_item'  => ['owner', 'admin_staff'],
    'update_item'  => ['owner', 'admin_staff'],
    'delete_item'  => ['owner'],
];

// 3. Inisialisasi Controller
new UMH_CRUD_Controller('hotels', 'umh_hotels', $hotels_schema, $hotels_permissions);

// TODO: Anda perlu membuat endpoint kustom untuk Hotel Bookings
// (tabel 'umh_hotel_bookings') karena ini adalah tabel relasi yang
// lebih kompleks dan mungkin tidak cocok dengan CRUD sederhana.