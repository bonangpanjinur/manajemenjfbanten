<?php
/**
 * Database Schema Definition
 * * File ini mendefinisikan seluruh struktur tabel database plugin.
 * Dijalankan saat plugin diaktifkan atau diupdate.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    // =========================================================================
    // 1. MASTER DATA
    // =========================================================================

    // Tabel Maskapai
    $sql_airlines = "CREATE TABLE {$wpdb->prefix}umh_airlines (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        code varchar(10) DEFAULT NULL, -- Misal: SV, GA
        logo_url varchar(255) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    // Tabel Hotel
    $sql_hotels = "CREATE TABLE {$wpdb->prefix}umh_hotels (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        city varchar(50) NOT NULL, -- Makkah / Madinah / Jeddah
        star_rating int(1) DEFAULT 0, -- Bintang 3, 4, 5
        address text DEFAULT NULL,
        distance_to_haram int(11) DEFAULT 0, -- Dalam meter
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // Tabel Kategori Paket
    $sql_categories = "CREATE TABLE {$wpdb->prefix}umh_categories (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        parent_id bigint(20) DEFAULT 0,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY parent_id (parent_id)
    ) $charset_collate;";
    dbDelta($sql_categories);

    // =========================================================================
    // 2. SUMBER DAYA MANUSIA (HR)
    // =========================================================================

    // Tabel Karyawan
    $sql_employees = "CREATE TABLE {$wpdb->prefix}umh_employees (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        position varchar(100) NOT NULL, -- Staff, Manager, Guide, Muthawif
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

    // =========================================================================
    // 3. MANAJEMEN PRODUK (PAKET UMROH)
    // =========================================================================

    // Tabel Paket Utama (Header)
    $sql_packages = "CREATE TABLE {$wpdb->prefix}umh_packages (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        category_id bigint(20) NOT NULL,
        airline_id bigint(20) NOT NULL, -- Relasi ke umh_airlines
        departure_date date NOT NULL,
        return_date date DEFAULT NULL,
        duration_days int(3) DEFAULT 9,
        quota int(5) DEFAULT 45,
        status enum('draft', 'active', 'full', 'completed', 'cancelled') DEFAULT 'active',
        itinerary_file varchar(255) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY status (status),
        KEY departure_date (departure_date)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // Tabel Relasi Paket ke Hotel (Many-to-Many)
    // Satu paket bisa menginap di 2 hotel (Makkah & Madinah)
    $sql_pkg_hotels = "CREATE TABLE {$wpdb->prefix}umh_package_hotels (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        hotel_id bigint(20) NOT NULL,
        city varchar(50) NOT NULL, -- Untuk menandai ini hotel Makkah atau Madinah
        duration_nights int(3) DEFAULT 0,
        check_in_date date DEFAULT NULL,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_hotels);

    // Tabel Varian Harga Paket (Quad, Triple, Double)
    $sql_pkg_prices = "CREATE TABLE {$wpdb->prefix}umh_package_prices (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        room_type varchar(50) NOT NULL, -- Quad, Triple, Double
        price decimal(15,2) NOT NULL,
        currency varchar(3) DEFAULT 'IDR',
        capacity int(5) DEFAULT 0, -- Kuota khusus tipe kamar ini (opsional)
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_prices);

    // =========================================================================
    // 4. JAMAAH & TRANSAKSI (BOOKING)
    // =========================================================================

    // Tabel Profil Jamaah (Master Data Jamaah)
    // Tidak ada package_id disini, karena ini profil orangnya yang bisa berangkat berkali-kali
    $sql_jamaah = "CREATE TABLE {$wpdb->prefix}umh_jamaah (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        full_name varchar(255) NOT NULL, -- Sesuai Paspor
        nik varchar(20) DEFAULT NULL,
        gender enum('L','P') NOT NULL,
        birth_date date NOT NULL,
        phone_number varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        passport_number varchar(50) DEFAULT NULL,
        passport_issued_date date DEFAULT NULL,
        passport_expiry_date date DEFAULT NULL,
        address_details longtext DEFAULT NULL, -- JSON Alamat lengkap
        files_data longtext DEFAULT NULL, -- JSON URL Scan Dokumen
        created_by bigint(20) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY passport_number (passport_number),
        KEY nik (nik)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // Tabel Booking / Registrasi (Transaksi)
    // Menghubungkan Jamaah ke Paket tertentu
    $sql_bookings = "CREATE TABLE {$wpdb->prefix}umh_bookings (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        booking_code varchar(20) NOT NULL, -- Kode Booking Unik
        jamaah_id bigint(20) NOT NULL,
        package_id bigint(20) NOT NULL,
        selected_room_type varchar(50) NOT NULL, -- Quad/Triple/Double
        agreed_price decimal(15,2) NOT NULL, -- Harga saat deal (mengunci harga)
        status enum('booked', 'dp_paid', 'paid', 'cancelled', 'completed') DEFAULT 'booked',
        
        -- Status Operasional per orang
        kit_status enum('pending', 'sent', 'received') DEFAULT 'pending',
        visa_status enum('pending', 'processing', 'issued') DEFAULT 'pending',
        document_status longtext DEFAULT NULL, -- JSON Checklist dokumen fisik
        
        agent_id bigint(20) DEFAULT NULL, -- Jika via agen
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY booking_code (booking_code),
        KEY jamaah_id (jamaah_id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    // Tabel Pembayaran (Cicilan/Pelunasan)
    $sql_payments = "CREATE TABLE {$wpdb->prefix}umh_payments (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) NOT NULL, -- Link ke Booking
        amount decimal(15,2) NOT NULL,
        payment_date date NOT NULL,
        payment_method varchar(50) DEFAULT 'transfer',
        proof_file varchar(255) DEFAULT NULL,
        status enum('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by bigint(20) DEFAULT NULL,
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_payments);

    // =========================================================================
    // 5. ROOMING LIST (MANAJEMEN KAMAR HOTEL)
    // =========================================================================
    
    // Tabel Kamar (Header)
    // Menyimpan data kamar fisik (No Kamar 101, Kapasitas 4 orang)
    $sql_rooms = "CREATE TABLE {$wpdb->prefix}umh_rooms (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_hotel_id bigint(20) NOT NULL, -- Relasi ke tabel umh_package_hotels
        room_number varchar(20) NOT NULL,
        room_type varchar(20) DEFAULT 'Quad', -- Quad/Triple/Double
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY package_hotel_id (package_hotel_id)
    ) $charset_collate;";
    dbDelta($sql_rooms);

    // Tabel Penghuni Kamar (Detail)
    // Siapa saja yang ada di kamar tersebut
    $sql_room_guests = "CREATE TABLE {$wpdb->prefix}umh_room_guests (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        room_id bigint(20) NOT NULL,
        booking_id bigint(20) NOT NULL, -- Relasi ke Booking Jamaah
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY room_id (room_id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_room_guests);

    // =========================================================================
    // 6. KEUANGAN & LAIN-LAIN (CASHFLOW, LEADS, AGENTS)
    // =========================================================================

    // Tabel Arus Kas Umum (Operasional Kantor)
    $sql_cashflow = "CREATE TABLE {$wpdb->prefix}umh_cashflow (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type enum('in','out') NOT NULL,
        category varchar(100) NOT NULL,
        amount decimal(15,2) NOT NULL,
        transaction_date date NOT NULL,
        description text NOT NULL,
        reference_id bigint(20) DEFAULT NULL, -- Bisa ID Payment atau ID Booking
        proof_file varchar(255) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_cashflow);

    // Tabel Leads (Calon Jamaah / Prospek)
    $sql_leads = "CREATE TABLE {$wpdb->prefix}umh_leads (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        contact varchar(100) NOT NULL,
        source varchar(50) DEFAULT NULL,
        status varchar(50) DEFAULT 'new',
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);
    
    // Tabel Agen / Mitra
    $sql_agents = "CREATE TABLE {$wpdb->prefix}umh_sub_agents (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        address_details longtext DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // Simpan versi DB agar plugin tahu struktur sudah update
    update_option( 'umh_db_version', UMH_DB_VERSION );
}