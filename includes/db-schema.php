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
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 2. Tabel Kategori
    $table_categories = $wpdb->prefix . 'umh_categories';
    $sql_categories = "CREATE TABLE $table_categories (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        parent_id bigint(20) DEFAULT 0,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 3. Tabel Paket
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
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 4. Tabel Jamaah
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
        PRIMARY KEY  (id)
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
        PRIMARY KEY  (id)
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
        balance_after decimal(15,2) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
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
        PRIMARY KEY  (id)
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

    // --- BARU: HR & GAJI (Poin 3, 6) ---
    
    // 9. Tabel Data Karyawan (Extension dari WP Users)
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        wp_user_id bigint(20) NOT NULL,
        position varchar(100) NOT NULL,
        basic_salary decimal(15,2) DEFAULT 0,
        allowance decimal(15,2) DEFAULT 0,
        join_date date DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 10. Tabel Absensi (Poin 6)
    $table_attendance = $wpdb->prefix . 'umh_attendance';
    $sql_attendance = "CREATE TABLE $table_attendance (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) NOT NULL,
        date date NOT NULL,
        status enum('present', 'absent', 'sick', 'permission') NOT NULL,
        check_in time DEFAULT NULL,
        check_out time DEFAULT NULL,
        notes text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 11. Tabel Kasbon (Poin 3)
    $table_cashbond = $wpdb->prefix . 'umh_cashbond';
    $sql_cashbond = "CREATE TABLE $table_cashbond (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) NOT NULL,
        amount decimal(15,2) NOT NULL,
        request_date date NOT NULL,
        reason text NOT NULL,
        status enum('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 12. Tabel Laporan Kerja (Poin 9)
    $table_reports = $wpdb->prefix . 'umh_work_reports';
    $sql_reports = "CREATE TABLE $table_reports (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) NOT NULL,
        report_date date NOT NULL,
        content text NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    
    // 13. Tabel Tasks / Job Desc (Poin 10)
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) NOT NULL,
        title varchar(255) NOT NULL,
        description text DEFAULT NULL,
        due_date date DEFAULT NULL,
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_by bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 14. Tabel Users (Headless/Custom Login jika tidak pakai WP User)
    $table_users = $wpdb->prefix . 'umh_users';
    $sql_users = "CREATE TABLE $table_users (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        wp_user_id bigint(20) DEFAULT NULL,
        email varchar(100) NOT NULL,
        full_name varchar(100) NOT NULL,
        role varchar(50) NOT NULL,
        phone varchar(20) DEFAULT NULL,
        password_hash varchar(255) DEFAULT NULL,
        auth_token varchar(255) DEFAULT NULL,
        token_expires datetime DEFAULT NULL,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
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
    dbDelta( $sql_employees );
    dbDelta( $sql_attendance );
    dbDelta( $sql_cashbond );
    dbDelta( $sql_reports );
    dbDelta( $sql_tasks );
    dbDelta( $sql_users );

    update_option( 'umh_db_version', UMH_DB_VERSION );
}