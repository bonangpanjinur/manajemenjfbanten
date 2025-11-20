<?php
/**
 * Manajemen Role & Capabilities (Hak Akses)
 * File ini dijalankan saat plugin diaktifkan untuk mendaftarkan role baru.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_Roles {

    public static function init() {
        // Jalankan hanya saat aktivasi plugin (biasanya dipanggil di hook aktivasi)
        self::create_roles();
    }

    public static function create_roles() {
        // Hapus role lama jika ada untuk reset (hati-hati di production)
        // remove_role('umh_staff');
        // remove_role('umh_finance');
        // remove_role('umh_owner');

        // 1. ROLE: STAFF ADMINISTRASI (Input Jamaah & Paket)
        add_role( 'umh_staff', 'Staff Travel', array(
            'read'         => true,
            'upload_files' => true, // Bisa upload KTP/Paspor
            // Custom Caps
            'umh_view_dashboard' => true,
            'umh_manage_jamaah'  => true,  // CRUD Jamaah
            'umh_view_packages'  => true,
            'umh_manage_packages'=> false, // Tidak boleh edit harga paket
            'umh_view_finance'   => false, // Tidak boleh lihat keuangan
            'umh_manage_finance' => false,
        ));

        // 2. ROLE: FINANCE (Keuangan & Kasir)
        add_role( 'umh_finance', 'Staff Keuangan', array(
            'read'         => true,
            'upload_files' => true, // Bukti transfer
            // Custom Caps
            'umh_view_dashboard' => true,
            'umh_manage_jamaah'  => false, // Hanya view
            'umh_view_jamaah'    => true,
            'umh_view_packages'  => true,
            'umh_manage_finance' => true,  // CRUD Finance
            'umh_view_finance'   => true,
        ));

        // 3. ROLE: OWNER / SUPERVISOR (Akses Penuh tapi bukan Admin WP)
        add_role( 'umh_owner', 'Owner / Pimpinan', array(
            'read'         => true,
            'upload_files' => true,
            // Custom Caps (Full Access)
            'umh_view_dashboard' => true,
            'umh_manage_jamaah'  => true,
            'umh_manage_packages'=> true,
            'umh_manage_finance' => true,
            'umh_view_reports'   => true, // Lihat statistik profit
        ));

        // Tambahkan caps ini ke Administrator bawaan WP juga agar admin tetap bisa akses
        $admin = get_role('administrator');
        $caps = array(
            'umh_view_dashboard', 'umh_manage_jamaah', 'umh_manage_packages', 
            'umh_manage_finance', 'umh_view_finance', 'umh_view_reports'
        );
        foreach ($caps as $cap) {
            $admin->add_cap($cap);
        }
    }
}