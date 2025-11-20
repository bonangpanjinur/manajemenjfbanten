<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function umh_create_tables() {
    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();

    // 1. Tabel Master Data
    $table_master = $wpdb->prefix . 'umh_master_data';
    $sql_master = "CREATE TABLE $table_master (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type varchar(50) NOT NULL,
        name varchar(255) NOT NULL,
        details longtext DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY type (type)
    ) $charset_collate;";

    // 2. Tabel Kategori
    $table_categories = $wpdb->prefix . 'umh_categories';
    $sql_categories = "CREATE TABLE $table_categories (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        parent_id bigint(20) DEFAULT 0,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY parent_id (parent_id)
    ) $charset_collate;";

    // 3. Tabel Paket (Added Index on status & departure_date)
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        category_id bigint(20) NOT NULL,
        sub_category_id bigint(20) DEFAULT NULL,
        departure_date date NOT NULL,
        airline_id bigint(20) NOT NULL,
        hotels longtext NOT NULL,
        pricing_variants longtext NOT NULL,
        itinerary_file varchar(255) DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY category_id (category_id),
        KEY status (status),
        KEY departure_date (departure_date)
    ) $charset_collate;";

    // 4. Tabel Jamaah (Added Index on package_id, passport, payment_status)
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        package_id bigint(20) NOT NULL,
        selected_room_type varchar(50) NOT NULL,
        package_price decimal(15,2) NOT NULL,
        full_name varchar(255) NOT NULL,
        gender enum('L','P') NOT NULL,
        birth_date date NOT NULL,
        passport_number varchar(50) DEFAULT NULL,
        passport_issued_date date DEFAULT NULL,
        passport_expiry_date date DEFAULT NULL,
        phone_number varchar(20) NOT NULL,
        address_details longtext DEFAULT NULL,
        pic_id bigint(20) DEFAULT NULL,
        files_ktp varchar(255) DEFAULT NULL,
        files_kk varchar(255) DEFAULT NULL,
        files_meningitis varchar(255) DEFAULT NULL,
        files_passport varchar(255) DEFAULT NULL,
        document_status longtext DEFAULT NULL,
        kit_status varchar(20) DEFAULT 'pending',
        payment_status varchar(20) DEFAULT 'unpaid',
        amount_paid decimal(15,2) DEFAULT 0,
        total_paid decimal(15,2) DEFAULT 0,
        created_by bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_id (package_id),
        KEY passport_number (passport_number),
        KEY payment_status (payment_status),
        KEY kit_status (kit_status)
    ) $charset_collate;";

    // 5. Tabel Pembayaran Jamaah
    $table_payments = $wpdb->prefix . 'umh_payments';
    $sql_payments = "CREATE TABLE $table_payments (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) NOT NULL,
        amount decimal(15,2) NOT NULL,
        payment_date date NOT NULL,
        payment_method varchar(50) NOT NULL,
        proof_file varchar(255) DEFAULT NULL,
        notes text DEFAULT NULL,
        verified_by bigint(20) DEFAULT NULL,
        status varchar(20) DEFAULT 'verified',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id),
        KEY payment_date (payment_date)
    ) $charset_collate;";

    // 6. Tabel Arus Kas
    $table_cash_flow = $wpdb->prefix . 'umh_cash_flow';
    $sql_cash_flow = "CREATE TABLE $table_cash_flow (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type varchar(10) NOT NULL,
        category varchar(100) NOT NULL,
        amount decimal(15,2) NOT NULL,
        transaction_date date NOT NULL,
        description text NOT NULL,
        proof_file varchar(255) DEFAULT NULL,
        reference_id bigint(20) DEFAULT NULL,
        balance_after decimal(15,2) NOT NULL DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY type (type),
        KEY transaction_date (transaction_date)
    ) $charset_collate;";

    // 7. Tabel Leads (Marketing)
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(50) NOT NULL,
        email varchar(100) DEFAULT NULL,
        source varchar(50) DEFAULT 'manual',
        status varchar(50) DEFAULT 'new',
        notes text DEFAULT NULL,
        assigned_to bigint(20) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY status (status),
        KEY assigned_to (assigned_to)
    ) $charset_collate;";

    // 8. Tabel Sub Agen
    $table_agents = $wpdb->prefix . 'umh_sub_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(50) NOT NULL,
        email varchar(100) DEFAULT NULL,
        city varchar(100) DEFAULT NULL,
        address text DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        commission_rate decimal(5,2) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    
    // ... (Tabel HR lainnya tetap sama, pastikan ditambahkan index pada user_id/employee_id jika perlu)
    
    // 13. Tabel Tasks
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) NOT NULL,
        user_id bigint(20) NOT NULL, -- Pastikan konsisten nama kolomnya (employee_id vs user_id)
        title varchar(255) NOT NULL,
        description text DEFAULT NULL,
        due_date date DEFAULT NULL,
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        priority enum('normal', 'high') DEFAULT 'normal',
        is_impromptu tinyint(1) DEFAULT 0,
        created_by bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY status (status)
    ) $charset_collate;";

    // Users table (custom)
    $table_users = $wpdb->prefix . 'umh_users';
    $sql_users = "CREATE TABLE $table_users (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        wp_user_id bigint(20) DEFAULT NULL,
        email varchar(100) NOT NULL,
        full_name varchar(100) NOT NULL,
        role varchar(50) NOT NULL,
        phone varchar(20) DEFAULT NULL,
        password_hash varchar(255) DEFAULT NULL,
        salary_base decimal(15,2) DEFAULT 0,
        auth_token varchar(255) DEFAULT NULL,
        token_expires datetime DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY email (email),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    // Eksekusi dbDelta
    dbDelta( $sql_master );
    dbDelta( $sql_categories );
    dbDelta( $sql_packages );
    dbDelta( $sql_jamaah );
    dbDelta( $sql_payments );
    dbDelta( $sql_cash_flow );
    dbDelta( $sql_leads );
    dbDelta( $sql_agents );
    // dbDelta( $sql_employees ); // Jika digabung ke umh_users, ini mungkin tidak perlu
    // dbDelta( $sql_attendance );
    // dbDelta( $sql_cashbond );
    // dbDelta( $sql_reports );
    dbDelta( $sql_tasks );
    dbDelta( $sql_users );

    update_option( 'umh_db_version', UMH_DB_VERSION );
}