<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_Logger {

    /**
     * Catat aktivitas ke tabel Log / Custom Table
     * @param string $action e.g., 'create_payment', 'delete_jamaah'
     * @param string $message Deskripsi aktivitas
     * @param int $ref_id ID Data yang diubah (opsional)
     */
    public static function log( $action, $message, $ref_id = 0 ) {
        global $wpdb;
        
        // Kita bisa simpan di tabel wp_umh_logs (perlu dibuat di db-schema)
        // Atau sementara simpan di wp_options / error_log untuk simpelnya
        // Disini saya contohkan pakai error_log PHP dulu agar ringan
        
        $user = wp_get_current_user();
        $user_name = $user->exists() ? $user->display_name . " (ID: {$user->ID})" : 'System/Guest';
        
        $log_entry = sprintf(
            "[UMH AUDIT] %s | User: %s | Action: %s | Ref: %d | %s",
            current_time( 'mysql' ),
            $user_name,
            $action,
            $ref_id,
            $message
        );

        // Opsi 1: Simpan ke file log server (Ringan)
        error_log( $log_entry );

        // Opsi 2 (Recomended): Simpan ke Tabel Database Custom (agar bisa dilihat di dashboard)
        /*
        $table = $wpdb->prefix . 'umh_audit_logs';
        $wpdb->insert($table, array(
            'user_id' => $user->ID,
            'action'  => $action,
            'message' => $message,
            'ref_id'  => $ref_id,
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'created_at' => current_time('mysql')
        ));
        */
    }
}