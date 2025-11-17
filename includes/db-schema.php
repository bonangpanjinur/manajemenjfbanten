<?php
// Lokasi: includes/db-schema.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Fungsi untuk membuat tabel-tabel database kustom saat aktivasi plugin.
 */
function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    $table_prefix = $wpdb->prefix . 'umh_';

    // 1. Tabel Jemaah
    $sql_jamaah = "CREATE TABLE {$table_prefix}jamaah (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20),
        departure_id BIGINT(20),
        lead_id BIGINT(20),
        full_name VARCHAR(255) NOT NULL,
        id_number VARCHAR(100),
        passport_number VARCHAR(100),
        passport_expiry DATE,
        phone_number VARCHAR(30),
        email VARCHAR(100),
        address TEXT,
        date_of_birth DATE,
        gender VARCHAR(10),
        status VARCHAR(50) DEFAULT 'pending',
        registration_date DATETIME NOT NULL,
        total_payment DECIMAL(15, 2) DEFAULT 0.00,
        payment_status VARCHAR(50) DEFAULT 'unpaid',
        agent_id BIGINT(20),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // 2. Tabel Paket Umroh
    $sql_packages = "CREATE TABLE {$table_prefix}packages (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(50),
        price_details TEXT,
        includes TEXT,
        excludes TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'draft',
        hotel_ids_text TEXT,
        flight_ids_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 3. Tabel Keberangkatan (Departures)
    $sql_departures = "CREATE TABLE {$table_prefix}departures (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        departure_date DATE NOT NULL,
        return_date DATE NOT NULL,
        quota INT NOT NULL,
        filled_quota INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'open',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_departures);

    // 4. Tabel Pembayaran Jemaah
    $sql_jamaah_payments = "CREATE TABLE {$table_prefix}jamaah_payments (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        proof_of_payment_url VARCHAR(255),
        verified_by BIGINT(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah_payments);

    // 5. Tabel Dokumen Jemaah
    $sql_jamaah_documents = "CREATE TABLE {$table_prefix}jamaah_documents (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah_documents);

    // 6. Tabel Marketing (Leads)
    $sql_marketing = "CREATE TABLE {$table_prefix}marketing (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        full_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(30),
        email VARCHAR(100),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        assigned_to_user_id BIGINT(20),
        package_of_interest_id BIGINT(20),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    // 7. Tabel HR (Karyawan)
    $sql_hr = "CREATE TABLE {$table_prefix}hr (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        full_name VARCHAR(255),
        position VARCHAR(100),
        join_date DATE,
        phone_number VARCHAR(30),
        address TEXT,
        salary DECIMAL(15, 2),
        status VARCHAR(50) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (user_id)
    ) $charset_collate;";
    dbDelta($sql_hr);

    // 8. Tabel Keuangan (Transaksi)
    $sql_finance = "CREATE TABLE {$table_prefix}finance (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        transaction_date DATE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        type VARCHAR(20) NOT NULL,
        category_id BIGINT(20),
        description TEXT,
        related_jamaah_id BIGINT(20),
        related_payment_id BIGINT(20),
        created_by BIGINT(20),
        status VARCHAR(50) DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // 9. Tabel Kategori Keuangan
    $sql_categories = "CREATE TABLE {$table_prefix}categories (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        description TEXT,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_categories);

    // 10. Tabel Log Aktivitas
    $sql_logs = "CREATE TABLE {$table_prefix}logs (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20),
        action_type VARCHAR(50) NOT NULL,
        related_table VARCHAR(100),
        related_id BIGINT(20),
        description TEXT,
        details_json LONGTEXT,
        timestamp DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_logs);

    // 11. Tabel Maskapai (Flights)
    $sql_flights = "CREATE TABLE {$table_prefix}flights (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        airline_name VARCHAR(100) NOT NULL,
        flight_number VARCHAR(50),
        departure_airport VARCHAR(100),
        arrival_airport VARCHAR(100),
        departure_time DATETIME,
        arrival_time DATETIME,
        price DECIMAL(15, 2),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_flights);

    // 12. Tabel Hotel
    $sql_hotels = "CREATE TABLE {$table_prefix}hotels (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        address TEXT,
        star_rating TINYINT(1),
        price_per_night DECIMAL(15, 2),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // 13. Tabel Relasi Booking Hotel (Paket <-> Hotel)
    $sql_hotel_bookings = "CREATE TABLE {$table_prefix}hotel_bookings (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        hotel_id BIGINT(20) NOT NULL,
        check_in_date DATE,
        check_out_date DATE,
        notes TEXT,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_hotel_bookings);

    // 14. Tabel Relasi Booking Maskapai (Paket <-> Flight)
    $sql_flight_bookings = "CREATE TABLE {$table_prefix}flight_bookings (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        flight_id BIGINT(20) NOT NULL,
        notes TEXT,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_flight_bookings);

    // 15. Tabel Tugas (Tasks)
    $sql_tasks = "CREATE TABLE {$table_prefix}tasks (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        due_date DATE,
        assigned_to_user_id BIGINT(20),
        created_by BIGINT(20),
        related_table VARCHAR(100),
        related_id BIGINT(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // --- PERBAIKAN (Kategori 2, Poin 2): Tambahkan Tabel Roles ---
    $sql_roles = "CREATE TABLE {$table_prefix}roles (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        role_key VARCHAR(100) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (role_key)
    ) $charset_collate;";
    dbDelta($sql_roles);

    // Seed tabel roles dengan data default jika kosong
    $roles_table = $table_prefix . 'roles';
    $existing_roles = $wpdb->get_var("SELECT COUNT(*) FROM $roles_table");
    if ($existing_roles == 0) {
        $wpdb->insert($roles_table, ['role_key' => 'owner', 'display_name' => 'Owner'], ['%s', '%s']);
        $wpdb->insert($roles_table, ['role_key' => 'admin_staff', 'display_name' => 'Admin Staff'], ['%s', '%s']);
        $wpdb->insert($roles_table, ['role_key' => 'finance_staff', 'display_name' => 'Finance Staff'], ['%s', '%s']);
        $wpdb->insert($roles_table, ['role_key' => 'marketing_staff', 'display_name' => 'Marketing Staff'], ['%s', '%s']);
        $wpdb->insert($roles_table, ['role_key' => 'hr_staff', 'display_name' => 'HR Staff'], ['%s', '%s']);
    }
    // --- AKHIR PERBAIKAN ---

}