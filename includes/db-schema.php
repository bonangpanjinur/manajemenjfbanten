<?php
// Lokasi: includes/db-schema.php

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Daftar tabel dan query SQL-nya
    $sql = [];

    // 1. Tabel Packages
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql[] = "CREATE TABLE $table_packages (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        duration_days INT(11) DEFAULT NULL,
        start_date DATE DEFAULT NULL,
        end_date DATE DEFAULT NULL,
        departure_city VARCHAR(100) DEFAULT NULL,
        total_seats INT(11) DEFAULT 0,
        available_seats INT(11) DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'available',
        itinerary LONGTEXT DEFAULT NULL,
        includes LONGTEXT DEFAULT NULL,
        price_details LONGTEXT DEFAULT NULL,
        includes_flights TINYINT(1) DEFAULT 1,
        includes_hotels TINYINT(1) DEFAULT 1,
        includes_visa TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 2. Tabel Sub Agents
    // Perbaikan: Hapus INDEX duplikat jika sudah didefinisikan di KEY
    $table_agents = $wpdb->prefix . 'umh_sub_agents';
    $sql[] = "CREATE TABLE $table_agents (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        agent_id VARCHAR(50) DEFAULT NULL,
        name VARCHAR(150) NOT NULL,
        join_date DATE DEFAULT NULL,
        id_number VARCHAR(30) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY agent_id (agent_id)
    ) $charset_collate;";

    // 3. Tabel Jamaah
    // Perbaikan: Pastikan syntax bersih dari komentar baris
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql[] = "CREATE TABLE $table_jamaah (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) UNSIGNED DEFAULT NULL,
        sub_agent_id BIGINT(20) UNSIGNED DEFAULT NULL,
        full_name VARCHAR(255) NOT NULL,
        id_number VARCHAR(50) DEFAULT NULL,
        passport_number VARCHAR(50) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        total_price DECIMAL(15, 2) DEFAULT 0.00,
        amount_paid DECIMAL(15, 2) DEFAULT 0.00,
        notes TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY sub_agent_id (sub_agent_id)
    ) $charset_collate;";

    // 4. Tabel Jamaah Payments
    $table_payments = $wpdb->prefix . 'umh_jamaah_payments';
    $sql[] = "CREATE TABLE $table_payments (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) UNSIGNED NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'transfer',
        proof_url VARCHAR(255) DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";

    // 5. Tabel HR (Staff)
    $table_hr = $wpdb->prefix . 'umh_hr';
    $sql[] = "CREATE TABLE $table_hr (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        wp_user_id BIGINT(20) UNSIGNED NOT NULL,
        role_id BIGINT(20) UNSIGNED DEFAULT NULL,
        full_name VARCHAR(150) DEFAULT NULL,
        position VARCHAR(100) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        salary DECIMAL(15, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";

    // 6. Tabel Roles
    $table_roles = $wpdb->prefix . 'umh_roles';
    $sql[] = "CREATE TABLE $table_roles (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        permissions_json LONGTEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 7. Tabel Logs
    $table_logs = $wpdb->prefix . 'umh_logs';
    $sql[] = "CREATE TABLE $table_logs (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) UNSIGNED DEFAULT 0,
        action_type VARCHAR(50) NOT NULL,
        related_table VARCHAR(50) DEFAULT NULL,
        related_id BIGINT(20) UNSIGNED DEFAULT NULL,
        description TEXT DEFAULT NULL,
        details_json LONGTEXT DEFAULT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // Eksekusi dbDelta
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    
    foreach ($sql as $query) {
        dbDelta($query);
    }
}