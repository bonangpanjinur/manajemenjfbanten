<?php
/**
 * Database Schema Definition - Complete Version
 * Includes: Mahram features, Multi-role support (Agent/Branch links), and all standard tables.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    // 1. Branches (Cabang)
    $sql_branches = "CREATE TABLE {$wpdb->prefix}umh_branches (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        code varchar(20) NOT NULL,
        name varchar(255) NOT NULL,
        city varchar(100) NOT NULL,
        address text DEFAULT NULL,
        head_of_branch varchar(255) DEFAULT NULL,
        phone varchar(20) DEFAULT NULL,
        status enum('active', 'inactive') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY code (code)
    ) $charset_collate;";
    dbDelta($sql_branches);

    // 2. Categories (Kategori Paket)
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

    // 3. Hotels (Master Data Hotel)
    $sql_hotels = "CREATE TABLE {$wpdb->prefix}umh_hotels (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        city varchar(50) DEFAULT 'Makkah',
        star_rating int(1) DEFAULT 3,
        distance_to_haram int(11) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // 4. Airlines (Maskapai)
    $sql_airlines = "CREATE TABLE {$wpdb->prefix}umh_airlines (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        code varchar(10) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    // 5. Employees (Karyawan)
    $sql_employees = "CREATE TABLE {$wpdb->prefix}umh_employees (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) DEFAULT 0,
        name varchar(255) NOT NULL,
        position varchar(100) DEFAULT NULL,
        phone varchar(20) DEFAULT NULL,
        email varchar(100) DEFAULT NULL,
        salary decimal(15,2) DEFAULT 0,
        status enum('active', 'inactive') DEFAULT 'active',
        access_permissions longtext DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY branch_id (branch_id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 6. Attendance (Absensi)
    $sql_attendance = "CREATE TABLE {$wpdb->prefix}umh_attendance (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        date date NOT NULL,
        check_in_time datetime DEFAULT NULL,
        check_in_lat varchar(50) DEFAULT NULL,
        check_in_lng varchar(50) DEFAULT NULL,
        check_in_address text DEFAULT NULL,
        check_out_time datetime DEFAULT NULL,
        check_out_lat varchar(50) DEFAULT NULL,
        check_out_lng varchar(50) DEFAULT NULL,
        status enum('present', 'late', 'permit', 'sick') DEFAULT 'present',
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY date (date)
    ) $charset_collate;";
    dbDelta($sql_attendance);

    // 7. Packages (Paket Umrah)
    $sql_packages = "CREATE TABLE {$wpdb->prefix}umh_packages (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        category_id bigint(20) DEFAULT 0,
        sub_category_id bigint(20) DEFAULT 0,
        airline_id bigint(20) DEFAULT 0,
        departure_date date NOT NULL,
        return_date date DEFAULT NULL,
        duration_days int(3) DEFAULT 9,
        quota int(11) DEFAULT 0,
        status enum('active','full','completed','inactive') DEFAULT 'active',
        itinerary_file varchar(255) DEFAULT NULL,
        description longtext DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY category_id (category_id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 8. Package Prices (Harga Paket per Tipe Kamar)
    $sql_pkg_prices = "CREATE TABLE {$wpdb->prefix}umh_package_prices (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        room_type varchar(50) NOT NULL, -- Quad, Triple, Double
        price decimal(15,2) DEFAULT 0,
        currency varchar(10) DEFAULT 'IDR',
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_prices);

    // 9. Package Hotels (Hotel yang dipakai di Paket)
    $sql_pkg_hotels = "CREATE TABLE {$wpdb->prefix}umh_package_hotels (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        hotel_id bigint(20) NOT NULL,
        city varchar(50) DEFAULT NULL,
        duration_nights int(3) DEFAULT 0,
        check_in date DEFAULT NULL,
        check_out date DEFAULT NULL,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_hotels);

    // 10. Sub Agents (Agen Travel)
    $sql_agents = "CREATE TABLE {$wpdb->prefix}umh_sub_agents (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        address text DEFAULT NULL,
        city varchar(100) DEFAULT NULL,
        commission_rate decimal(5,2) DEFAULT 0,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 11. Jamaah (Data Jemaah - LENGKAP dengan Mahram & Relasi)
    $sql_jamaah = "CREATE TABLE {$wpdb->prefix}umh_jamaah (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) DEFAULT 0,
        full_name varchar(255) NOT NULL,
        nik varchar(20) DEFAULT NULL,
        passport_number varchar(50) DEFAULT NULL,
        passport_issued date DEFAULT NULL,
        passport_expiry date DEFAULT NULL,
        gender enum('L','P') DEFAULT 'L',
        birth_date date DEFAULT NULL,
        phone_number varchar(20) DEFAULT NULL,
        address_details longtext DEFAULT NULL,
        sub_agent_id bigint(20) DEFAULT 0,
        
        -- Kolom Baru untuk Keluarga/Mahram
        mahram_id bigint(20) DEFAULT 0,
        relation varchar(50) DEFAULT NULL,

        document_status longtext DEFAULT NULL,
        files longtext DEFAULT NULL,
        status enum('lead','registered','active','completed','cancelled','deleted') DEFAULT 'registered',
        payment_status varchar(20) DEFAULT 'pending',
        amount_paid decimal(15,2) DEFAULT 0,
        total_price decimal(15,2) DEFAULT 0,
        
        package_id bigint(20) DEFAULT 0,

        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY branch_id (branch_id),
        KEY sub_agent_id (sub_agent_id),
        KEY package_id (package_id),
        KEY mahram_id (mahram_id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // 12. Leads (Calon Jemaah Potensial)
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

    // 13. Bookings (Transaksi Pemesanan)
    $sql_bookings = "CREATE TABLE {$wpdb->prefix}umh_bookings (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        booking_code varchar(20) NOT NULL,
        jamaah_id bigint(20) NOT NULL,
        package_id bigint(20) NOT NULL,
        selected_room_type varchar(50) DEFAULT 'Quad',
        agreed_price decimal(15,2) DEFAULT 0,
        booking_date date DEFAULT NULL,
        status enum('pending','confirmed','cancelled') DEFAULT 'confirmed',
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY booking_code (booking_code),
        KEY jamaah_id (jamaah_id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    // 14. Jamaah Payments (Riwayat Pembayaran Jemaah)
    $sql_j_payments = "CREATE TABLE {$wpdb->prefix}umh_jamaah_payments (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) NOT NULL,
        booking_id bigint(20) DEFAULT 0,
        amount decimal(15,2) NOT NULL,
        payment_date date NOT NULL,
        payment_method varchar(50) DEFAULT 'transfer',
        proof_of_payment_url varchar(255) DEFAULT NULL,
        status enum('pending','paid','rejected') DEFAULT 'pending',
        description text DEFAULT NULL,
        verified_by bigint(20) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_j_payments);

    // 15. Cash Flow (Arus Kas Umum)
    $sql_cashflow = "CREATE TABLE {$wpdb->prefix}umh_cash_flow (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type enum('in','out') NOT NULL, 
        category varchar(100) NOT NULL, 
        amount decimal(15,2) NOT NULL,
        transaction_date date NOT NULL,
        description text NOT NULL,
        reference_id bigint(20) DEFAULT NULL, 
        proof_file varchar(255) DEFAULT NULL,
        balance_after decimal(15,2) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_cashflow);

    // 16. Rooms (Kamar Hotel)
    $sql_rooms = "CREATE TABLE {$wpdb->prefix}umh_rooms (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_hotel_id bigint(20) NOT NULL,
        room_number varchar(20) NOT NULL,
        room_type enum('Quad','Triple','Double') DEFAULT 'Quad',
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_hotel_id (package_hotel_id)
    ) $charset_collate;";
    dbDelta($sql_rooms);

    // 17. Room Guests (Isi Kamar / Rooming List)
    $sql_room_guests = "CREATE TABLE {$wpdb->prefix}umh_room_guests (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        room_id bigint(20) NOT NULL,
        booking_id bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY room_id (room_id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_room_guests);

    // 18. Inventory (Perlengkapan)
    $sql_inventory = "CREATE TABLE {$wpdb->prefix}umh_inventory (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        sku varchar(50) DEFAULT NULL,
        type enum('equipment','souvenir','document') DEFAULT 'equipment',
        stock_quantity int(11) DEFAULT 0,
        min_stock_alert int(11) DEFAULT 10,
        unit varchar(50) DEFAULT 'pcs',
        description text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_inventory);

    // 19. Jamaah Equipment (Distribusi Perlengkapan)
    $sql_dist = "CREATE TABLE {$wpdb->prefix}umh_jamaah_equipment (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) NOT NULL,
        inventory_id bigint(20) NOT NULL,
        qty int(11) DEFAULT 1,
        status enum('pending','taken','returned') DEFAULT 'taken',
        taken_date datetime DEFAULT CURRENT_TIMESTAMP,
        taken_by_name varchar(255) DEFAULT NULL,
        officer_id bigint(20) DEFAULT 0,
        notes text DEFAULT NULL,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id),
        KEY inventory_id (inventory_id)
    ) $charset_collate;";
    dbDelta($sql_dist);

    // 20. Logs (Log Aktivitas)
    $sql_logs = "CREATE TABLE {$wpdb->prefix}umh_logs (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        action_type varchar(50) NOT NULL,
        related_table varchar(50) NOT NULL,
        related_id bigint(20) NOT NULL,
        description text NOT NULL,
        details_json longtext DEFAULT NULL,
        timestamp datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logs);

    // 21. Users (Manajemen User Custom - LENGKAP dengan Relasi Agen/Cabang)
    $sql_users = "CREATE TABLE {$wpdb->prefix}umh_users (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        wp_user_id bigint(20) DEFAULT NULL,
        email varchar(100) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(100) NOT NULL,
        
        role varchar(50) NOT NULL DEFAULT 'staff', 
        -- Role values: 'super_admin', 'owner', 'branch_manager', 'agent', 'staff'

        linked_agent_id bigint(20) DEFAULT 0,  -- ID Agen jika role='agent'
        linked_branch_id bigint(20) DEFAULT 0, -- ID Cabang jika role='branch_manager'

        phone varchar(20) DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        auth_token varchar(255) DEFAULT NULL,
        token_expires datetime DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY linked_agent_id (linked_agent_id),
        KEY linked_branch_id (linked_branch_id)
    ) $charset_collate;";
    dbDelta($sql_users);
    
    // 22. Work Reports (Laporan Harian Karyawan)
    $sql_tasks = "CREATE TABLE {$wpdb->prefix}umh_work_reports (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        report_date date NOT NULL,
        content longtext NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // Simpan versi DB untuk kontrol update ke depan
    update_option( 'umh_db_version', UMH_DB_VERSION );
}