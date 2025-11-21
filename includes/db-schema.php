<?php
/**
 * Database Schema Definition
 * File ini mendefinisikan struktur tabel lengkap untuk plugin Manajemen Travel Umroh.
 * Menjalankan dbDelta untuk membuat atau memperbarui tabel.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    // 1. MASTER DATA: CATEGORIES (Dengan Support Sub-Kategori)
    $sql_categories = "CREATE TABLE {$wpdb->prefix}umh_categories (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        parent_id bigint(20) DEFAULT 0,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        description text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY parent_id (parent_id)
    ) $charset_collate;";
    dbDelta($sql_categories);

    // 2. MASTER DATA: PACKAGES (Paket Umroh)
    $sql_packages = "CREATE TABLE {$wpdb->prefix}umh_packages (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        price decimal(15,2) DEFAULT 0,
        currency varchar(10) DEFAULT 'IDR',
        departure_date date NOT NULL,
        return_date date DEFAULT NULL,
        quota int(11) DEFAULT 0,
        hotel_makkah varchar(255) DEFAULT NULL,
        hotel_madinah varchar(255) DEFAULT NULL,
        airline varchar(100) DEFAULT NULL,
        status enum('active','inactive','completed') DEFAULT 'active',
        description longtext DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 3. CORE: SUB AGENTS (Agen Penyalur)
    $sql_agents = "CREATE TABLE {$wpdb->prefix}umh_sub_agents (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        address_details longtext DEFAULT NULL,
        commission_rate decimal(5,2) DEFAULT 0,
        status varchar(20) DEFAULT 'active',
        join_date date DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 4. CORE: JAMAAH (Data Jemaah)
    $sql_jamaah = "CREATE TABLE {$wpdb->prefix}umh_jamaah (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        full_name varchar(255) NOT NULL,
        ktp_number varchar(50) DEFAULT NULL,
        passport_number varchar(50) DEFAULT NULL,
        gender enum('L','P') DEFAULT NULL,
        birth_date date DEFAULT NULL,
        birth_place varchar(100) DEFAULT NULL,
        phone_number varchar(20) DEFAULT NULL,
        address text DEFAULT NULL,
        city varchar(100) DEFAULT NULL,
        sub_agent_id bigint(20) DEFAULT 0,
        status enum('lead','registered','active','completed','cancelled') DEFAULT 'registered',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY sub_agent_id (sub_agent_id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // 5. CORE: BOOKINGS (Transaksi Pendaftaran Paket oleh Jemaah)
    $sql_bookings = "CREATE TABLE {$wpdb->prefix}umh_bookings (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) NOT NULL,
        package_id bigint(20) NOT NULL,
        booking_date date DEFAULT NULL,
        total_price decimal(15,2) DEFAULT 0,
        status enum('pending','confirmed','cancelled') DEFAULT 'pending',
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    // 6. FINANCE: PAYMENTS (Pembayaran Masuk dari Jemaah)
    $sql_payments = "CREATE TABLE {$wpdb->prefix}umh_payments (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) NOT NULL,
        amount decimal(15,2) NOT NULL,
        payment_date date NOT NULL,
        payment_method varchar(50) DEFAULT 'transfer',
        proof_file varchar(255) DEFAULT NULL,
        status enum('pending','verified','rejected') DEFAULT 'pending',
        verified_by bigint(20) DEFAULT 0,
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_payments);

    // 7. FINANCE: CASH FLOW (Keuangan Umum, Operasional & Kasbon)
    $sql_cashflow = "CREATE TABLE {$wpdb->prefix}umh_cash_flow (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type enum('in','out') NOT NULL, 
        category varchar(100) NOT NULL, -- 'Operasional', 'Gaji', 'Kasbon', 'Pelunasan', dll
        amount decimal(15,2) NOT NULL,
        transaction_date date NOT NULL,
        description text NOT NULL,
        reference_id bigint(20) DEFAULT NULL, -- Bisa ID Karyawan (kasbon) atau ID Jamaah
        proof_file varchar(255) DEFAULT NULL,
        balance_after decimal(15,2) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_cashflow);

    // 8. HR: EMPLOYEES (Data Karyawan)
    $sql_employees = "CREATE TABLE {$wpdb->prefix}umh_employees (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        wp_user_id bigint(20) DEFAULT NULL,
        name varchar(255) NOT NULL,
        position varchar(100) NOT NULL, -- Jabatan dinamis (string)
        phone varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        salary decimal(15,2) DEFAULT 0,
        join_date date DEFAULT NULL,
        status enum('active', 'inactive') DEFAULT 'active',
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 9. MARKETING: LEADS (Prospek Jemaah)
    $sql_leads = "CREATE TABLE {$wpdb->prefix}umh_leads (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        contact varchar(100) NOT NULL,
        source varchar(50) DEFAULT NULL, -- FB Ads, IG, Walk-in, dll
        status varchar(50) DEFAULT 'new', -- new, contacting, closing, lost
        notes text DEFAULT NULL,
        follow_up_date date DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);

    // 10. MASTER DATA: HOTELS
    $sql_hotels = "CREATE TABLE {$wpdb->prefix}umh_hotels (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        city enum('Makkah','Madinah','Jeddah','Transit') NOT NULL,
        star_rating int(1) DEFAULT 3,
        distance_to_haram int(11) DEFAULT 0, -- dalam meter
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // 11. MASTER DATA: AIRLINES (Maskapai)
    $sql_airlines = "CREATE TABLE {$wpdb->prefix}umh_airlines (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        code varchar(10) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    // 12. OPERATIONS: ROOMING LIST (Pembagian Kamar Hotel)
    $sql_rooming = "CREATE TABLE {$wpdb->prefix}umh_rooming_lists (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        hotel_id bigint(20) NOT NULL,
        room_number varchar(20) NOT NULL,
        room_type enum('quad','triple','double') DEFAULT 'quad',
        jamaah_ids text DEFAULT NULL, -- Disimpan sebagai JSON Array string: [1, 2, 3]
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_rooming);

    // Simpan versi DB agar bisa di-update di masa depan
    update_option( 'umh_db_version', UMH_DB_VERSION );
}