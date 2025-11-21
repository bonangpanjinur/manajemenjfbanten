<?php
/**
 * Database Schema Definition
 * FIXED: Menghapus semua komentar inline (--) agar dbDelta berjalan sukses.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    // 1. AUTH & USERS
    $sql_users = "CREATE TABLE {$wpdb->prefix}umh_users (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        wp_user_id bigint(20) DEFAULT NULL,
        email varchar(100) NOT NULL,
        full_name varchar(255) NOT NULL,
        role varchar(50) NOT NULL DEFAULT 'subscriber',
        password_hash varchar(255) DEFAULT NULL,
        phone varchar(20) DEFAULT NULL,
        auth_token varchar(255) DEFAULT NULL,
        token_expires datetime DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY email (email),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";
    dbDelta($sql_users);

    // 2. MASTER DATA
    $sql_airlines = "CREATE TABLE {$wpdb->prefix}umh_airlines (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        code varchar(10) DEFAULT NULL,
        logo_url varchar(255) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    $sql_hotels = "CREATE TABLE {$wpdb->prefix}umh_hotels (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        city varchar(50) NOT NULL,
        star_rating int(1) DEFAULT 0,
        address text DEFAULT NULL,
        distance_to_haram int(11) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

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

    // 3. HR (EMPLOYEES)
    $sql_employees = "CREATE TABLE {$wpdb->prefix}umh_employees (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        wp_user_id bigint(20) DEFAULT NULL,
        name varchar(255) NOT NULL,
        position varchar(100) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        salary decimal(15,2) DEFAULT 0,
        join_date date DEFAULT NULL,
        status enum('active', 'inactive') DEFAULT 'active',
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 4. PACKAGES
    $sql_packages = "CREATE TABLE {$wpdb->prefix}umh_packages (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        category_id bigint(20) NOT NULL,
        airline_id bigint(20) NOT NULL,
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

    $sql_pkg_hotels = "CREATE TABLE {$wpdb->prefix}umh_package_hotels (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        hotel_id bigint(20) NOT NULL,
        city varchar(50) NOT NULL,
        duration_nights int(3) DEFAULT 0,
        check_in_date date DEFAULT NULL,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_hotels);

    $sql_pkg_prices = "CREATE TABLE {$wpdb->prefix}umh_package_prices (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        room_type varchar(50) NOT NULL,
        price decimal(15,2) NOT NULL,
        currency varchar(3) DEFAULT 'IDR',
        capacity int(5) DEFAULT 0,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_prices);

    // 5. JAMAAH & BOOKING
    $sql_jamaah = "CREATE TABLE {$wpdb->prefix}umh_jamaah (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        full_name varchar(255) NOT NULL,
        nik varchar(20) DEFAULT NULL,
        gender enum('L','P') NOT NULL,
        birth_date date NOT NULL,
        phone_number varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        passport_number varchar(50) DEFAULT NULL,
        passport_issued_date date DEFAULT NULL,
        passport_expiry_date date DEFAULT NULL,
        address_details longtext DEFAULT NULL,
        files_data longtext DEFAULT NULL,
        created_by bigint(20) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        amount_paid decimal(15,2) DEFAULT 0,
        payment_status varchar(20) DEFAULT 'pending',
        total_price decimal(15,2) DEFAULT 0,
        package_id bigint(20) DEFAULT NULL,
        PRIMARY KEY  (id),
        KEY passport_number (passport_number),
        KEY nik (nik)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    $sql_bookings = "CREATE TABLE {$wpdb->prefix}umh_bookings (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        booking_code varchar(20) NOT NULL,
        jamaah_id bigint(20) NOT NULL,
        package_id bigint(20) NOT NULL,
        selected_room_type varchar(50) NOT NULL,
        agreed_price decimal(15,2) NOT NULL,
        status enum('booked', 'dp_paid', 'paid', 'cancelled', 'completed') DEFAULT 'booked',
        kit_status enum('pending', 'sent', 'received') DEFAULT 'pending',
        visa_status enum('pending', 'processing', 'issued') DEFAULT 'pending',
        document_status longtext DEFAULT NULL,
        agent_id bigint(20) DEFAULT NULL,
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY booking_code (booking_code),
        KEY jamaah_id (jamaah_id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    $sql_payments = "CREATE TABLE {$wpdb->prefix}umh_payments (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) DEFAULT NULL,
        jamaah_id bigint(20) NOT NULL,
        amount decimal(15,2) NOT NULL,
        payment_date date NOT NULL,
        payment_method varchar(50) DEFAULT 'transfer',
        proof_file varchar(255) DEFAULT NULL,
        description text DEFAULT NULL,
        status enum('pending', 'verified', 'rejected', 'paid') DEFAULT 'pending',
        verified_by bigint(20) DEFAULT NULL,
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_payments);

    // 6. ROOMS & CASHFLOW
    $sql_rooms = "CREATE TABLE {$wpdb->prefix}umh_rooms (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_hotel_id bigint(20) NOT NULL,
        room_number varchar(20) NOT NULL,
        room_type varchar(20) DEFAULT 'Quad',
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY package_hotel_id (package_hotel_id)
    ) $charset_collate;";
    dbDelta($sql_rooms);

    $sql_room_guests = "CREATE TABLE {$wpdb->prefix}umh_room_guests (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        room_id bigint(20) NOT NULL,
        booking_id bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY room_id (room_id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_room_guests);

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
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_cashflow);

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
    
    $sql_agents = "CREATE TABLE {$wpdb->prefix}umh_sub_agents (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(100) DEFAULT NULL,
        address_details longtext DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        join_date date DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    $sql_tasks = "CREATE TABLE {$wpdb->prefix}umh_tasks (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) NOT NULL,
        title varchar(255) NOT NULL,
        description text DEFAULT NULL,
        due_date date DEFAULT NULL,
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    $sql_reports = "CREATE TABLE {$wpdb->prefix}umh_work_reports (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        report_date date NOT NULL,
        content text NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_reports);

    $sql_logs = "CREATE TABLE {$wpdb->prefix}umh_logs (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        action_type varchar(50) NOT NULL,
        related_table varchar(50) DEFAULT NULL,
        related_id bigint(20) DEFAULT NULL,
        description text DEFAULT NULL,
        details_json longtext DEFAULT NULL,
        timestamp datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_logs);

    update_option( 'umh_db_version', UMH_DB_VERSION );
}