<?php
// File: includes/api/api-finance.php
// Menggunakan CRUD Controller untuk mengelola Keuangan.
// (DIMODIFIKASI untuk skema tabel keuangan yang baru)

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. Definisikan Skema Data (cocokkan dengan db-schema.php VERSI 1.3)
$finance_schema = [
    'transaction_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
    'description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'transaction_type' => ['type' => 'string', 'required' => true, 'enum' => ['income', 'expense']],
    'amount' => ['type' => 'number', 'required' => true],
    'category_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'account_id' => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'], // Dibuat wajib untuk petty cash
    'jamaah_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'user_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'], // Diisi oleh controller
    'status' => ['type' => 'string', 'required' => false, 'default' => 'completed', 'enum' => ['pending', 'completed']],
];

// 2. Definisikan Izin (Hanya Owner & Staf Keuangan)
$finance_permissions = [
    'get_items'    => ['owner', 'finance_staff'],
    'get_item'     => ['owner', 'finance_staff'],
    'create_item'  => ['owner', 'finance_staff'],
    'update_item'  => ['owner', 'finance_staff'],
    'delete_item'  => ['owner', 'finance_staff'],
];

// 3. Inisialisasi Controller
new UMH_CRUD_Controller('finance', 'umh_finance', $finance_schema, $finance_permissions);

// (BARU) API untuk Akun Keuangan (Petty Cash, dll)
$accounts_schema = [
    'name' => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
];
// Hanya owner yang bisa atur akun
$accounts_permissions = [
    'get_items'    => ['owner', 'finance_staff'], // Staf boleh lihat
    'get_item'     => ['owner', 'finance_staff'],
    'create_item'  => ['owner'],
    'update_item'  => ['owner'],
    'delete_item'  => ['owner'],
];
new UMH_CRUD_Controller('finance/accounts', 'umh_finance_accounts', $accounts_schema, $accounts_permissions);