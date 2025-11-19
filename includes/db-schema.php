<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function umh_create_tables() {
    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();

    // 1. Tabel Master Data (Hotel, Maskapai, Perlengkapan, dll)
    // Type: 'airline', 'hotel', 'equipment', etc.
    // Details: JSON field untuk detail tambahan (misal: lokasi hotel, bintang hotel)
    $table_master = $wpdb->prefix . 'umh_master_data';
    $sql_master = "CREATE TABLE $table_master (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type varchar(50) NOT NULL,
        name varchar(255) NOT NULL,
        details longtext DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 2. Tabel Kategori (Umroh Awal Tahun, Haji Furoda, dll)
    $table_categories = $wpdb->prefix . 'umh_categories';
    $sql_categories = "CREATE TABLE $table_categories (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        parent_id bigint(20) DEFAULT 0,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 3. Tabel Paket (Dengan Harga Varian Dinamis)
    // Hotels: JSON Array ID Hotel
    // Pricing Variants: JSON Array [{type: 'Quad', price: 30jt}, {type: 'Quint', price: 28jt}]
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

    // 4. Tabel Jamaah (Data Lengkap)
    // Menyimpan snapshot harga dan tipe kamar saat pendaftaran
    // Address details: JSON API wilayah
    // Document status: JSON status checklist
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
        total_paid decimal(15,2) DEFAULT 0,
        created_by bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 5. Tabel Pembayaran Jamaah (Detail Transaksi Masuk)
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
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 6. Tabel Arus Kas (Cash Flow Operasional)
    // Type: 'in' atau 'out'
    // Balance after: Saldo setelah transaksi
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

    // 7. Tabel Hak Akses Role (Custom Permission)
    // Permissions: JSON array ['view_jamaah', 'edit_finance']
    $table_roles = $wpdb->prefix . 'umh_role_permissions';
    $sql_roles = "CREATE TABLE $table_roles (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        role_name varchar(50) NOT NULL,
        permissions longtext NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // 8. Tabel Leads (Marketing)
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        contact varchar(50) NOT NULL,
        source varchar(50) NOT NULL,
        status varchar(50) DEFAULT 'new',
        notes text DEFAULT NULL,
        assigned_to bigint(20) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    // Eksekusi dbDelta satu per satu untuk memastikan akurasi
    dbDelta( $sql_master );
    dbDelta( $sql_categories );
    dbDelta( $sql_packages );
    dbDelta( $sql_jamaah );
    dbDelta( $sql_payments );
    dbDelta( $sql_cash_flow );
    dbDelta( $sql_roles );
    dbDelta( $sql_leads );

    // Simpan versi DB saat ini
    update_option( 'umh_db_version', UMH_DB_VERSION );
}