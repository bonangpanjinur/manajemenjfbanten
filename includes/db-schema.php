<?php
// File Location: includes/db-schema.php

if ( ! defined( 'ABSPATH' ) ) exit;

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // 1. Tabel Master Data (Hotel, Maskapai)
    $table_master = $wpdb->prefix . 'umh_master_data';
    $sql_master = "CREATE TABLE $table_master (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type varchar(50) NOT NULL, -- 'airline', 'hotel'
        name varchar(255) NOT NULL,
        details longtext DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY type (type)
    ) $charset_collate;";

    // 2. Tabel Kategori & Sub Kategori
    $table_categories = $wpdb->prefix . 'umh_categories';
    $sql_categories = "CREATE TABLE $table_categories (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        parent_id bigint(20) DEFAULT 0, -- 0 = Utama, >0 = Sub
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY parent_id (parent_id)
    ) $charset_collate;";

    // 3. Tabel Paket Umroh/Haji
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        category_id bigint(20) NOT NULL,
        sub_category_id bigint(20) DEFAULT NULL,
        departure_date date NOT NULL,
        airline_id bigint(20) NOT NULL,
        hotels longtext NOT NULL, -- JSON Array ID Hotel
        pricing_variants longtext NOT NULL, -- JSON Array Varian Kamar & Harga
        itinerary_file varchar(255) DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY category_id (category_id)
    ) $charset_collate;";

    // 4. Tabel Data Jemaah
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        selected_room_type varchar(50) NOT NULL,
        package_price decimal(15,2) NOT NULL,
        full_name varchar(255) NOT NULL,
        gender enum('L','P') NOT NULL,
        birth_date date NOT NULL,
        phone_number varchar(20) NOT NULL,
        passport_number varchar(50) DEFAULT NULL,
        passport_expiry_date date DEFAULT NULL,
        passport_issued_date date DEFAULT NULL,
        address_details longtext DEFAULT NULL, -- JSON {prov, kab, kec, desa, detail}
        files_data longtext DEFAULT NULL, -- JSON path file (ktp, kk, dll)
        document_status longtext DEFAULT NULL, -- JSON checklist status
        kit_status varchar(20) DEFAULT 'pending', -- diterima/dikirim/belum
        payment_status varchar(20) DEFAULT 'unpaid',
        total_paid decimal(15,2) DEFAULT 0,
        pic_id bigint(20) DEFAULT NULL, -- ID User/Agent yang input
        created_by bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";

    // 5. Tabel Riwayat Pembayaran Jemaah
    $table_payments = $wpdb->prefix . 'umh_payments';
    $sql_payments = "CREATE TABLE $table_payments (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) NOT NULL,
        amount decimal(15,2) NOT NULL,
        payment_date date NOT NULL,
        proof_file varchar(255) DEFAULT NULL,
        notes text DEFAULT NULL,
        verified_by bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";

    // 6. Tabel Arus Kas (Keuangan)
    $table_cashflow = $wpdb->prefix . 'umh_cashflow';
    $sql_cashflow = "CREATE TABLE $table_cashflow (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type enum('in','out') NOT NULL,
        category varchar(100) NOT NULL,
        amount decimal(15,2) NOT NULL,
        transaction_date date NOT NULL,
        description text NOT NULL,
        proof_file varchar(255) DEFAULT NULL,
        created_by bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    // 7. Tabel Marketing Leads (Calon Jemaah)
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        contact varchar(100) NOT NULL,
        source varchar(50) DEFAULT NULL, -- ig, wa, tiktok, fb, offline
        status varchar(50) DEFAULT 'new', -- new, closing, lost
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 8. Tabel Sub Agent
    $table_agents = $wpdb->prefix . 'umh_sub_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        address_details longtext DEFAULT NULL, -- JSON Alamat Lengkap
        join_date date NOT NULL,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 9. Tabel Daily Report (Laporan Kerja Harian)
    $table_reports = $wpdb->prefix . 'umh_work_reports';
    $sql_reports = "CREATE TABLE $table_reports (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL, -- WP User ID
        report_date date NOT NULL,
        content longtext NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";

    // 10. Tabel Custom Roles & Permissions (Manajemen Staff)
    // Untuk menyimpan role khusus aplikasi diluar role WP standar
    $table_roles = $wpdb->prefix . 'umh_custom_roles';
    $sql_roles = "CREATE TABLE $table_roles (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        role_code varchar(50) NOT NULL,
        role_name varchar(100) NOT NULL,
        permissions longtext DEFAULT NULL, -- JSON Hak Akses (e.g., ['view_jamaah', 'edit_jamaah'])
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 11. Tabel Detail Karyawan (Mapping WP User ke Custom Role)
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL, -- Relasi ke tabel wp_users
        custom_role_id bigint(20) DEFAULT NULL, -- Relasi ke umh_custom_roles
        phone varchar(20) DEFAULT NULL,
        address text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    
    dbDelta( $sql_master );
    dbDelta( $sql_categories );
    dbDelta( $sql_packages );
    dbDelta( $sql_jamaah );
    dbDelta( $sql_payments );
    dbDelta( $sql_cashflow );
    dbDelta( $sql_leads );
    dbDelta( $sql_agents );
    dbDelta( $sql_reports );
    dbDelta( $sql_roles );
    dbDelta( $sql_employees );

    update_option( 'umh_db_version', UMH_DB_VERSION );
}