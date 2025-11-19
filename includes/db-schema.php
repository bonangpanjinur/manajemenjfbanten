<?php
// Lokasi: includes/db-schema.php

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    $sql = [];

    // 1. Tabel Packages (Updated: JSON fields for flexibility)
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql[] = "CREATE TABLE $table_packages (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        pricing_variants LONGTEXT DEFAULT NULL, -- JSON: [{type: 'Quad', price: 25000000}, ...]
        departure_dates LONGTEXT DEFAULT NULL, -- JSON: ['2023-10-10', '2023-11-15']
        duration_days INT(11) DEFAULT 9,
        total_seats INT(11) DEFAULT 45,
        available_seats INT(11) DEFAULT 45,
        status VARCHAR(20) NOT NULL DEFAULT 'available',
        itinerary_url VARCHAR(255) DEFAULT NULL,
        airline_ids LONGTEXT DEFAULT NULL, -- JSON: [1, 2]
        hotel_ids LONGTEXT DEFAULT NULL, -- JSON: [1, 5]
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 2. Tabel Sub Agents (Updated: Address details)
    $table_agents = $wpdb->prefix . 'umh_sub_agents';
    $sql[] = "CREATE TABLE $table_agents (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        province VARCHAR(100) DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        district VARCHAR(100) DEFAULT NULL,
        village VARCHAR(100) DEFAULT NULL,
        address_full TEXT DEFAULT NULL,
        join_date DATE DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 3. Tabel Jamaah (Updated: Documents)
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql[] = "CREATE TABLE $table_jamaah (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) UNSIGNED DEFAULT NULL,
        sub_agent_id BIGINT(20) UNSIGNED DEFAULT NULL,
        full_name VARCHAR(255) NOT NULL,
        ktp_number VARCHAR(50) DEFAULT NULL,
        passport_number VARCHAR(50) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        documents_json LONGTEXT DEFAULT NULL, -- JSON: {ktp: 'url', kk: 'url', passport: 'url'}
        total_price DECIMAL(15, 2) DEFAULT 0.00,
        amount_paid DECIMAL(15, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, partial, paid
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 4. Tabel Finance (General & Jamaah Transactions)
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql[] = "CREATE TABLE $table_finance (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        transaction_date DATE NOT NULL,
        type VARCHAR(20) NOT NULL, -- income, expense
        category VARCHAR(50) DEFAULT 'General', -- Pembayaran Jamaah, Operasional, Gaji, dll
        amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        description TEXT DEFAULT NULL,
        jamaah_id BIGINT(20) UNSIGNED DEFAULT NULL, -- Relasi jika pembayaran jemaah
        proof_url VARCHAR(255) DEFAULT NULL,
        created_by BIGINT(20) UNSIGNED DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 5. Tabel Master Airlines (NEW)
    $table_airlines = $wpdb->prefix . 'umh_airlines';
    $sql[] = "CREATE TABLE $table_airlines (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        logo_url VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 6. Tabel Master Hotels (NEW)
    $table_hotels = $wpdb->prefix . 'umh_hotels';
    $sql[] = "CREATE TABLE $table_hotels (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        star_rating INT(1) DEFAULT 3,
        city VARCHAR(100) DEFAULT NULL,
        map_link TEXT DEFAULT NULL,
        photo_url VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 7. Tabel Marketing Leads
    $table_leads = $wpdb->prefix . 'umh_marketing';
    $sql[] = "CREATE TABLE $table_leads (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        source VARCHAR(50) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'new',
        notes TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

     // 8. Tabel HR / Staff
    $table_hr = $wpdb->prefix . 'umh_hr';
    $sql[] = "CREATE TABLE $table_hr (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) UNSIGNED NOT NULL, -- Link ke WP User
        role_name VARCHAR(50) DEFAULT 'staff',
        permissions LONGTEXT DEFAULT NULL, -- JSON array hak akses
        phone VARCHAR(20) DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";


    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    foreach ($sql as $query) {
        dbDelta($query);
    }
}