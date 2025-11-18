<?php
// Lokasi: includes/db-schema.php
// PERBAIKAN: Ini adalah file skema database yang seharusnya.
// Konten React yang salah telah dipindahkan ke src/pages/Jamaah.jsx

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Membuat semua tabel kustom yang diperlukan oleh plugin.
 */
function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    $table_prefix = $wpdb->prefix . 'umh_';

    // 1. Tabel Pengguna (Headless)
    $table_name = $table_prefix . 'users';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        wp_user_id BIGINT(20) UNSIGNED DEFAULT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'karyawan',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        auth_token VARCHAR(128) DEFAULT NULL,
        token_expires DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 2. Tabel Roles (Divisi)
    $table_name = $table_prefix . 'roles';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT DEFAULT NULL,
        permissions_json TEXT DEFAULT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 3. Tabel HR (Karyawan internal, terhubung ke wp_users)
    $table_name = $table_prefix . 'hr';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        wp_user_id BIGINT(20) UNSIGNED NOT NULL UNIQUE,
        role_id BIGINT(20) UNSIGNED DEFAULT NULL,
        join_date DATE DEFAULT NULL,
        salary DECIMAL(15, 2) DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        PRIMARY KEY (id),
        KEY wp_user_id (wp_user_id),
        KEY role_id (role_id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 4. Tabel Paket Umroh/Haji
    $table_name = $table_prefix . 'packages';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        price DECIMAL(15, 2) DEFAULT 0.00,
        price_details JSON DEFAULT NULL,
        duration VARCHAR(50) DEFAULT NULL,
        start_date DATE DEFAULT NULL,
        end_date DATE DEFAULT NULL,
        departure_city VARCHAR(100) DEFAULT NULL,
        total_seats INT(11) DEFAULT 0,
        available_seats INT(11) DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        includes JSON DEFAULT NULL,
        itinerary JSON DEFAULT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 5. Tabel Keberangkatan (Jadwal per paket)
    $table_name = $table_prefix . 'departures';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) UNSIGNED NOT NULL,
        departure_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 6. Tabel Master Hotel
    $table_name = $table_prefix . 'hotels';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        stars INT(1) DEFAULT 3,
        address TEXT DEFAULT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 7. Tabel Master Penerbangan
    $table_name = $table_prefix . 'flights';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        airline_name VARCHAR(100) NOT NULL,
        flight_number VARCHAR(20) NOT NULL,
        departure_airport VARCHAR(50) NOT NULL,
        arrival_airport VARCHAR(50) NOT NULL,
        departure_time DATETIME DEFAULT NULL,
        arrival_time DATETIME DEFAULT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 8. Tabel Hubung: Paket <-> Hotel
    $table_name = $table_prefix . 'hotel_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) UNSIGNED NOT NULL,
        hotel_id BIGINT(20) UNSIGNED NOT NULL,
        check_in DATE DEFAULT NULL,
        check_out DATE DEFAULT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY hotel_id (hotel_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 9. Tabel Hubung: Paket <-> Penerbangan
    $table_name = $table_prefix . 'flight_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) UNSIGNED NOT NULL,
        flight_id BIGINT(20) UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY flight_id (flight_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 10. Tabel Jemaah
    $table_name = $table_prefix . 'jamaah';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) UNSIGNED NOT NULL,
        user_id BIGINT(20) UNSIGNED DEFAULT NULL,
        -- Penambahan: Kolom untuk sub_agent_id
        sub_agent_id BIGINT(20) UNSIGNED DEFAULT NULL,
        -- Akhir Penambahan
        full_name VARCHAR(150) NOT NULL,
        id_number VARCHAR(30) DEFAULT NULL,
        passport_number VARCHAR(30) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        gender VARCHAR(10) DEFAULT 'male',
        birth_date DATE DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        total_price DECIMAL(15, 2) DEFAULT 0.00,
        amount_paid DECIMAL(15, 2) DEFAULT 0.00,
        passport_scan VARCHAR(255) DEFAULT NULL,
        ktp_scan VARCHAR(255) DEFAULT NULL,
        kk_scan VARCHAR(255) DEFAULT NULL,
        meningitis_scan VARCHAR(255) DEFAULT NULL,
        profile_photo VARCHAR(255) DEFAULT NULL,
        is_passport_verified TINYINT(1) DEFAULT 0,
        is_ktp_verified TINYINT(1) DEFAULT 0,
        is_kk_verified TINYINT(1) DEFAULT 0,
        is_meningitis_verified TINYINT(1) DEFAULT 0,
        equipment_status VARCHAR(30) DEFAULT 'belum_di_kirim',
        notes TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY user_id (user_id),
        -- Penambahan: Index untuk sub_agent_id
        KEY sub_agent_id (sub_agent_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 11. Tabel Riwayat Pembayaran Jemaah
    $table_name = $table_prefix . 'jamaah_payments';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) UNSIGNED NOT NULL,
        payment_date DATE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'transfer',
        description VARCHAR(255) DEFAULT NULL,
        proof_of_payment_url VARCHAR(255) DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 12. Tabel Keuangan (Kas)
    $table_name = $table_prefix . 'finance_accounts';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT DEFAULT NULL,
        balance DECIMAL(15, 2) DEFAULT 0.00,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 13. Tabel Kategori Keuangan
    $table_name = $table_prefix . 'categories';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'expense',
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 14. Tabel Transaksi Keuangan (Umum)
    $table_name = $table_prefix . 'finance';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        transaction_date DATE NOT NULL,
        description TEXT DEFAULT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'expense',
        amount DECIMAL(15, 2) NOT NULL,
        category_id BIGINT(20) UNSIGNED DEFAULT NULL,
        account_id BIGINT(20) UNSIGNED DEFAULT NULL,
        jamaah_id BIGINT(20) UNSIGNED DEFAULT NULL,
        user_id BIGINT(20) UNSIGNED DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY category_id (category_id),
        KEY account_id (account_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 15. Tabel Marketing (Leads)
    $table_name = $table_prefix . 'marketing';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(100) DEFAULT NULL,
        phone VARCHAR(20) NOT NULL,
        source VARCHAR(50) DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'new',
        notes TEXT DEFAULT NULL,
        assigned_to_user_id BIGINT(20) UNSIGNED DEFAULT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 16. Tabel Tugas (Tasks)
    $table_name = $table_prefix . 'tasks';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        assigned_to_user_id BIGINT(20) UNSIGNED DEFAULT NULL,
        created_by_user_id BIGINT(20) UNSIGNED DEFAULT NULL,
        jamaah_id BIGINT(20) UNSIGNED DEFAULT NULL,
        due_date DATE DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 17. Tabel Log Aktivitas
    $table_name = $table_prefix . 'logs';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) UNSIGNED DEFAULT NULL,
        action_type VARCHAR(50) NOT NULL,
        related_table VARCHAR(100) DEFAULT NULL,
        related_id BIGINT(20) UNSIGNED DEFAULT NULL,
        description TEXT DEFAULT NULL,
        details_json JSON DEFAULT NULL,
        timestamp DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY action_type (action_type),
        KEY related_table_id (related_table, related_id)
    ) $charset_collate;";
    dbDelta($sql);

    // --- PENAMBAHAN: Tabel Sub Agents ---
    // 18. Tabel Sub Agents
    $table_name = $table_prefix . 'sub_agents';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        agent_id VARCHAR(50) DEFAULT NULL UNIQUE, -- No ID
        name VARCHAR(150) NOT NULL, -- NAMA
        join_date DATE DEFAULT NULL, -- TGL BERGABUNG
        id_number VARCHAR(30) DEFAULT NULL, -- NO KTP
        address TEXT DEFAULT NULL, -- ALAMAT
        phone VARCHAR(20) DEFAULT NULL, -- TELP
        notes TEXT DEFAULT NULL, -- KET
        status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql);
    // --- AKHIR PENAMBAHAN ---
}