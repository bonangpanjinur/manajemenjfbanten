<?php
// File: includes/db-schema.php
// Skema database kustom untuk plugin Umroh Manager Hybrid.
// VERSI 1.3: Penambahan skema detail paket, riwayat pembayaran jemaah,
//            checklist dokumen jemaah, dan status perlengkapan.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

global $umh_db_version;
$umh_db_version = '1.3'; // Versi dinaikkan

function umh_create_db_tables() {
    global $wpdb;
    global $umh_db_version;

    $installed_ver = get_option('umh_db_version');

    if ($installed_ver == $umh_db_version) {
        return; // Skema sudah terbaru
    }

    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // 1. Tabel Pengguna (Karyawan/Owner) - (Tidak berubah)
    $table_name = $wpdb->prefix . 'umh_users';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        wp_user_id BIGINT(20) UNSIGNED,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) NOT NULL, -- 'owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff', 'sopir', dll
        auth_token VARCHAR(255),
        token_expires DATETIME,
        status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 2. Tabel Paket Umroh (PERUBAHAN BESAR)
    // Menggunakan skema detail yang Anda berikan
    $table_name = $wpdb->prefix . 'umh_packages';
    $sql = "CREATE TABLE $table_name (
        `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `title` VARCHAR(255) NOT NULL,
        `slug` VARCHAR(255) UNIQUE,
        `image` VARCHAR(255),
        `promo` TINYINT(1) NOT NULL DEFAULT 0,
        `hotel_ids_text` TEXT, -- Menyimpan ID hotel (denormalized) seperti permintaan Anda
        `price_details` LONGTEXT, -- Menyimpan JSON harga (Quad, Triple, Double)
        `itinerary` LONGTEXT,
        `travel_id` INT(11), -- Relasi ke travel (jika ada tabelnya, jika tidak, bisa dihapus)
        `tipe_paket` VARCHAR(100), -- Misal: 'Umroh Reguler', 'Haji Furoda'
        `departure_city` VARCHAR(255),
        `duration` INT(3) NOT NULL DEFAULT 0,
        `period_start_month` VARCHAR(20) DEFAULT NULL,
        `period_end_month` VARCHAR(20) DEFAULT NULL,
        `period_year` VARCHAR(4) DEFAULT NULL,
        `meta_title` VARCHAR(255),
        `meta_description` TEXT,
        `keywords` TEXT,
        `short_description` TEXT,
        `faq_schema` LONGTEXT,
        `review_count` INT DEFAULT 0,
        `average_rating` DECIMAL(2,1) DEFAULT 0.0,
        `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `canonical_url` VARCHAR(255),
        `currency` VARCHAR(10) DEFAULT 'IDR',
        `status` VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
        `slots_available` INT(4),
        `slots_filled` INT(4) DEFAULT 0,
        `departure_date` DATE, -- Tetap ada untuk keberangkatan spesifik
        PRIMARY KEY (`id`),
        KEY `slug_idx` (`slug`),
        KEY `travel_id_idx` (`travel_id`)
    ) $charset_collate;";
    dbDelta($sql);

    // 3. Tabel Jemaah (PERUBAHAN BESAR)
    // Penambahan kolom dokumen, verifikasi, dan perlengkapan
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        user_id BIGINT(20), 
        full_name VARCHAR(255) NOT NULL,
        id_number VARCHAR(50) UNIQUE,
        passport_number VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        gender VARCHAR(10),
        birth_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'waitlist'
        
        -- Info Pembayaran (Summary)
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'dp', 'cicil', 'lunas', 'refunded'
        total_price DECIMAL(15, 2), -- Harga paket + add-on
        amount_paid DECIMAL(15, 2) DEFAULT 0.00, -- Total dari umh_jamaah_payments
        
        -- Dokumen (Upload)
        passport_scan VARCHAR(255),
        ktp_scan VARCHAR(255),
        kk_scan VARCHAR(255),
        meningitis_scan VARCHAR(255),
        profile_photo VARCHAR(255),
        
        -- Dokumen (Checklist Verifikasi Admin)
        is_passport_verified BOOLEAN NOT NULL DEFAULT 0,
        is_ktp_verified BOOLEAN NOT NULL DEFAULT 0,
        is_kk_verified BOOLEAN NOT NULL DEFAULT 0,
        is_meningitis_verified BOOLEAN NOT NULL DEFAULT 0,
        
        -- Perlengkapan (BARU)
        equipment_status ENUM('belum_di_kirim', 'di_kirim', 'diterima') NOT NULL DEFAULT 'belum_di_kirim',

        notes TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 4. Tabel Keuangan (PERUBAHAN BESAR)
    // Penambahan kolom untuk buku kas, debit/kredit, dan petty cash
    $table_name = $wpdb->prefix . 'umh_finance';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        transaction_date DATE NOT NULL,
        description VARCHAR(255),
        -- 'income' akan jadi KREDIT, 'expense' akan jadi DEBIT
        transaction_type ENUM('income', 'expense') NOT NULL, 
        amount DECIMAL(15, 2) NOT NULL,
        
        -- Kategori untuk Pelaporan (misal: 'Tiket', 'Hotel', 'Visa')
        category_id BIGINT(20), 
        
        -- Akun (BARU) untuk Petty Cash
        account_id BIGINT(20), -- Relasi ke umh_finance_accounts
        
        -- Relasi (Opsional)
        jamaah_id BIGINT(20), -- Jika ini pembayaran/refund jemaah
        user_id BIGINT(20), -- Staff yang mencatat
        
        status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'pending', 'completed'
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id),
        KEY user_id (user_id),
        KEY category_id (category_id),
        KEY account_id (account_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 5. Tabel Kategori Keuangan - (Tetap sederhana)
    $table_name = $wpdb->prefix . 'umh_categories';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        type ENUM('income', 'expense') NOT NULL, -- Tipe kategori
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 6. Tabel Akun Keuangan (BARU)
    // Untuk membedakan Buku Kas Utama dan Petty Cash
    $table_name = $wpdb->prefix . 'umh_finance_accounts';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE, -- 'Kas Utama', 'Kas Petty Cash'
        description TEXT,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 7. Tabel Riwayat Pembayaran Jemaah (BARU)
    // Ini adalah log detail pembayaran untuk satu jemaah
    $table_name = $wpdb->prefix . 'umh_jamaah_payments';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) NOT NULL,
        payment_date DATE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description VARCHAR(255), -- 'DP', 'Cicilan 1', 'Pelunasan'
        proof_of_payment_url VARCHAR(255), -- Link ke file upload
        status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
        -- ID transaksi di buku kas (opsional, jika ingin dilink)
        finance_transaction_id BIGINT(20), 
        created_by_user_id BIGINT(20), -- Staff yang memverifikasi
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 8. Tabel Tugas - (Tidak berubah)
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
    
    // 9. Tabel Log Aktivitas - (Tidak berubah)
    $table_name = $wpdb->prefix . 'umh_logs';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20), 
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

    // 10. Tabel Uploads - (Tidak berubah)
    // Akan digunakan untuk menyimpan bukti bayar, dll.
    $table_name = $wpdb->prefix . 'umh_uploads';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL, 
        jamaah_id BIGINT(20),
        related_id BIGINT(20), -- Bisa ID pembayaran, dll
        attachment_id BIGINT(20) NOT NULL, 
        file_url VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        upload_type VARCHAR(50), -- 'passport', 'ktp', 'payment_proof', 'other'
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 11. Tabel Profil Karyawan (HR) - (Tidak berubah)
    $table_name = $wpdb->prefix . 'umh_employee_profiles';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL, -- FK ke umh_users
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

    // 12. Tabel Absensi (HR) - (Tidak berubah)
    $table_name = $wpdb->prefix . 'umh_attendance';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL, -- FK ke umh_users
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

    // 13. Tabel Gaji/Payroll (HR) - (Tidak berubah)
    $table_name = $wpdb->prefix . 'umh_payrolls';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL, -- FK ke umh_users
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

    // 14. Tabel Hotel - (Tidak berubah)
    $table_name = $wpdb->prefix . 'umh_hotels';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        rating INT(1), -- 1-5 stars
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 15. Tabel Booking Hotel (Relasi Paket <-> Hotel) - (Tidak berubah)
    // Ini adalah cara yang lebih baik daripada `hotel_ids_text` di tabel paket
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

    // 16. Tabel Penerbangan (Flights) - (Tidak berubah)
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

    // 17. Tabel Booking Penerbangan (Relasi Paket <-> Flight) - (Tidak berubah)
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

    // 18. Tabel Kampanye Marketing - (Tidak berubah)
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

    // 19. Tabel Leads (Marketing) - (Tidak berubah)
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

    // --- Inisialisasi Data Default (BARU) ---
    // Tambahkan akun default untuk Keuangan
    $account_table = $wpdb->prefix . 'umh_finance_accounts';
    $default_accounts = ['Kas Utama', 'Petty Cash'];
    foreach ($default_accounts as $acc_name) {
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $account_table WHERE name = %s", $acc_name));
        if (!$exists) {
            $wpdb->insert($account_table, ['name' => $acc_name, 'created_at' => current_time('mysql')]);
        }
    }

    update_option('umh_db_version', $umh_db_version);
}
add_action('plugins_loaded', 'umh_create_db_tables');