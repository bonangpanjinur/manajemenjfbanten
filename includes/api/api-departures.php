<?php
// File: includes/api/api-departures.php
// PERBAIKAN: Menggunakan CRUD Controller untuk Keberangkatan.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// 1. Definisikan Skema Data
$departures_schema = [
    'package_id'     => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'departure_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
    'status'         => ['type' => 'string', 'required' => false, 'default' => 'scheduled', 'enum' => ['scheduled', 'departed', 'completed', 'cancelled']],
    // Tambahkan field lain dari tabel 'umh_departures' jika ada
];

// 2. Definisikan Izin
$departures_permissions = [
    'get_items'    => ['owner', 'admin_staff', 'marketing_staff'],
    'get_item'     => ['owner', 'admin_staff', 'marketing_staff'],
    'create_item'  => ['owner', 'admin_staff'],
    'update_item'  => ['owner', 'admin_staff'],
    'delete_item'  => ['owner'],
];

// 3. Inisialisasi Controller
// Parameter: ('endpoint_base', 'slug_tabel_db', $skema, $izin)
new UMH_CRUD_Controller('departures', 'umh_departures', $departures_schema, $departures_permissions);