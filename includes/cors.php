<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Handle CORS for REST API
 * Fungsi ini dipanggil oleh umroh-manager-hybrid.php saat init.
 */
function umh_handle_cors() {
    // Hanya jalankan jika ini adalah request REST API atau ada Origin header
    if ( ! defined( 'REST_REQUEST' ) && empty($_SERVER['HTTP_ORIGIN']) ) {
        return;
    }

    // Cek jika header sudah dihantar, jika ya, hentikan untuk elak error
    if ( headers_sent() ) {
        return;
    }

    // 1. Ambil Origin yang diizinkan
    $allowed_origins = array(
        get_site_url(),
        home_url(),
        'http://localhost:3000', // React Dev
        'http://localhost:5173', // Vite Dev
    );

    // 2. Cek Origin Request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // Jika origin ada di daftar allowed, atau kita ingin membolehkan semua (*) untuk sementara
    if ( in_array( $origin, $allowed_origins ) || !empty($origin) ) {
        @header( "Access-Control-Allow-Origin: " . $origin );
        @header( "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS" );
        @header( "Access-Control-Allow-Credentials: true" );
        @header( "Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With" );
        @header( "Vary: Origin" );
    }

    // 3. Handle Preflight Options (Agar tidak lanjut ke pemrosesan WP)
    if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
        status_header( 200 );
        exit();
    }
}

// Tambahkan filter tambahan untuk memastikan header terkirim di respons WP REST API normal
add_filter( 'rest_pre_serve_request', function( $value ) {
    if ( ! headers_sent() ) {
        umh_handle_cors(); 
    }
    return $value;
});