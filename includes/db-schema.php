<?php
// File: includes/db-schema.php
// Mendefinisikan skema database kustom untuk plugin.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

global $umh_db_version;
$umh_db_version = '1.2'; // Versi dinaikkan setelah menambah tabel HR, Hotel, Flight, Marketing

function umh_create_db_tables() {
    global $wpdb;
    global $umh_db_version;

    $installed_ver = get_option('umh_db_version');

    if ($installed_ver == $umh_db_version) {
        return; // Skema sudah terbaru
    }

    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // 1. Tabel Pengguna (Karyawan/Owner)
    $table_name = $wpdb->prefix . 'umh_users';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        wp_user_id BIGINT(20) UNSIGNED,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) NOT NULL, -- [PERBAIKAN] 'owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff', 'sopir', dll (Dinamis)
        auth_token VARCHAR(255),
        token_expires DATETIME,
        status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 2. Tabel Paket Umroh
    $table_name = $wpdb->prefix . 'umh_packages';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(15, 2) NOT NULL,
        departure_date DATE NOT NULL,
        duration INT(3) NOT NULL, -- in days
        status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
        slots_available INT(4),
        slots_filled INT(4) DEFAULT 0,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 3. Tabel Jemaah (Menggantikan umroh_manifest)
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        user_id BIGINT(20), -- ID dari umh_users jika jemaah juga pengguna
        full_name VARCHAR(255) NOT NULL,
        id_number VARCHAR(50) NOT NULL UNIQUE,
        passport_number VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        gender VARCHAR(10), -- 'male', 'female'
        birth_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'waitlist'
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
        total_price DECIMAL(15, 2),
        amount_paid DECIMAL(15, 2) DEFAULT 0.00,
        notes TEXT,
        passport_scan VARCHAR(255),
        ktp_scan VARCHAR(255),
        profile_photo VARCHAR(255),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 4. Tabel Keuangan
    $table_name = $wpdb->prefix . 'umh_finance';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20),
        user_id BIGINT(20), -- Staff yang mencatat
        category_id BIGINT(20),
        transaction_type VARCHAR(20) NOT NULL, -- 'income', 'expense'
        description VARCHAR(255),
        amount DECIMAL(15, 2) NOT NULL,
        transaction_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'pending', 'completed'
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id),
        KEY user_id (user_id),
        KEY category_id (category_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 5. Tabel Kategori (untuk Keuangan)
    $table_name = $wpdb->prefix . 'umh_categories';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'income', 'expense'
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 6. Tabel Tugas
    $table_name = $wpdb->prefix . 'umh_tasks';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        assigned_to_user_id BIGINT(20),
        created_by_user_id BIGINT(20),
        jamaah_id BIGINT(20),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
        priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY assigned_to_user_id (assigned_to_user_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 7. Tabel Log Aktivitas
    $table_name = $wpdb->prefix . 'umh_logs';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20), -- ID dari umh_users
        action VARCHAR(50) NOT NULL,
        object_type VARCHAR(50),
        object_id BIGINT(20),
        details TEXT,
        ip_address VARCHAR(100),
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 8. Tabel Uploads
    $table_name = $wpdb->prefix . 'umh_uploads';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL, -- User yang mengupload
        jamaah_id BIGINT(20),
        attachment_id BIGINT(20) NOT NULL, -- ID dari wp_posts (media library)
        file_url VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        upload_type VARCHAR(50), -- 'passport', 'ktp', 'photo', 'other'
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // --- SKEMA TABEL TAMBAHAN (HR, HOTELS, FLIGHTS, MARKETING) ---

    // 9. Tabel Profil Karyawan (HR)
    $table_name = $wpdb->prefix . 'umh_employee_profiles';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL, -- Foreign key to umh_users
        position VARCHAR(100),
        department VARCHAR(100),
        join_date DATE,
        salary DECIMAL(15, 2),
        bank_account_info TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'on_leave', 'terminated'
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 10. Tabel Absensi (HR)
    $table_name = $wpdb->prefix . 'umh_attendance';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL, -- Foreign key to umh_users
        check_in DATETIME,
        check_out DATETIME,
        attendance_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'present', -- 'present', 'absent', 'late', 'leave'
        notes TEXT,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        UNIQUE KEY user_date (user_id, attendance_date)
    ) $charset_collate;";
    dbDelta($sql);

    // 11. Tabel Gaji/Payroll (HR)
    $table_name = $wpdb->prefix . 'umh_payrolls';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL, -- Foreign key to umh_users
        pay_period_start DATE NOT NULL,
        pay_period_end DATE NOT NULL,
        base_salary DECIMAL(15, 2),
        bonus DECIMAL(15, 2) DEFAULT 0.00,
        deductions DECIMAL(15, 2) DEFAULT 0.00,
        net_pay DECIMAL(15, 2) NOT NULL,
        pay_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 12. Tabel Hotel
    $table_name = $wpdb->prefix . 'umh_hotels';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        rating INT(1), -- e.g., 1-5 stars
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 13. Tabel Booking Hotel (Relasi Paket <-> Hotel)
    $table_name = $wpdb->prefix . 'umh_hotel_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        hotel_id BIGINT(20) NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        room_type VARCHAR(100),
        booking_code VARCHAR(100),
        status VARCHAR(20) NOT NULL DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled'
        cost DECIMAL(15, 2),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY hotel_id (hotel_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 14. Tabel Penerbangan (Flights)
    $table_name = $wpdb->prefix . 'umh_flights';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        airline VARCHAR(100) NOT NULL,
        flight_number VARCHAR(20) NOT NULL,
        departure_airport_code VARCHAR(10) NOT NULL,
        arrival_airport_code VARCHAR(10) NOT NULL,
        departure_time DATETIME NOT NULL,
        arrival_time DATETIME NOT NULL,
        cost_per_seat DECIMAL(15, 2),
        total_seats INT(4),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 15. Tabel Booking Penerbangan (Relasi Paket <-> Flight)
    $table_name = $wpdb->prefix . 'umh_flight_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        flight_id BIGINT(20) NOT NULL,
        booking_code VARCHAR(100),
        status VARCHAR(20) NOT NULL DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled'
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY flight_id (flight_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 16. Tabel Kampanye Marketing
    $table_name = $wpdb->prefix . 'umh_marketing_campaigns';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50), -- 'social_media', 'google_ads', 'offline'
        start_date DATE,
        end_date DATE,
        budget DECIMAL(15, 2),
        status VARCHAR(20) NOT NULL DEFAULT 'planned', -- 'planned', 'active', 'completed'
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 17. Tabel Leads (Marketing)
    $table_name = $wpdb->prefix . 'umh_leads';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        campaign_id BIGINT(20),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        source VARCHAR(100), -- 'website', 'facebook', 'walk-in'
        status VARCHAR(20) NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'unqualified', 'converted'
        assigned_to_user_id BIGINT(20), -- Staff marketing
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY campaign_id (campaign_id),
        KEY assigned_to_user_id (assigned_to_user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // --- Selesai Penambahan Skema ---

    update_option('umh_db_version', $umh_db_version);
}
add_action('plugins_loaded', 'umh_create_db_tables');

// Fungsi untuk membersihkan tabel lama (Jalankan secara manual atau saat uninstall)
function umh_cleanup_old_tables() {
    global $wpdb;
    // $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}umroh_manifest");
    // $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}uhp_packages");
}
// register_deactivation_hook(__FILE__, 'umh_cleanup_old_tables'); // Hati-hati dengan ini