<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', 'umh_register_finance_routes');

function umh_register_finance_routes() {
    $namespace = 'umh/v1';

    // GET semua transaksi (Kas Umum & Jemaah)
    register_rest_route($namespace, '/finance', [
        'methods' => 'GET',
        'callback' => 'umh_get_finance_logs',
        'permission_callback' => '__return_true'
    ]);

    // POST Transaksi Umum (Kas Masuk/Keluar Operasional)
    register_rest_route($namespace, '/finance/general', [
        'methods' => 'POST',
        'callback' => 'umh_create_general_trx',
        'permission_callback' => function() { return current_user_can('edit_posts'); }
    ]);

    // POST Pembayaran Jemaah (Khusus)
    register_rest_route($namespace, '/finance/jamaah-payment', [
        'methods' => 'POST',
        'callback' => 'umh_create_jamaah_payment',
        'permission_callback' => function() { return current_user_can('edit_posts'); }
    ]);
}

function umh_get_finance_logs() {
    global $wpdb;
    // Ambil 100 transaksi terakhir
    return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_finance ORDER BY transaction_date DESC, id DESC LIMIT 100");
}

function umh_create_general_trx($request) {
    global $wpdb;
    $p = $request->get_json_params();

    $wpdb->insert($wpdb->prefix . 'umh_finance', [
        'transaction_date' => $p['date'],
        'type' => $p['type'], // income / expense
        'category' => 'General',
        'amount' => $p['amount'],
        'description' => $p['description'],
        'created_at' => current_time('mysql')
    ]);

    return ['success' => true, 'id' => $wpdb->insert_id];
}

// Logika Kompleks: Catat di Finance + Update Tagihan Jemaah
function umh_create_jamaah_payment($request) {
    global $wpdb;
    // Support multipart form data (file upload) atau JSON
    $params = $request->get_params(); 
    $files = $request->get_file_params();

    $jamaah_id = $params['jamaah_id'];
    $amount = $params['amount'];
    $package_id = $params['package_id'];
    
    // 1. Upload Bukti (Jika ada)
    $proof_url = '';
    if (!empty($files['proof_file'])) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        $uploaded = wp_handle_upload($files['proof_file'], ['test_form' => false]);
        if (!isset($uploaded['error'])) {
            $proof_url = $uploaded['url'];
        }
    }

    // 2. Insert ke Tabel Finance
    $wpdb->insert($wpdb->prefix . 'umh_finance', [
        'transaction_date' => current_time('mysql'),
        'type' => 'income',
        'category' => 'Pembayaran Jemaah',
        'amount' => $amount,
        'description' => "Pembayaran Umroh (Paket ID: $package_id)",
        'jamaah_id' => $jamaah_id,
        'proof_url' => $proof_url,
        'created_at' => current_time('mysql')
    ]);

    // 3. Update Data Jemaah (Total Bayar & Status)
    $jamaah = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}umh_jamaah WHERE id = $jamaah_id");
    $new_amount_paid = $jamaah->amount_paid + $amount;
    
    // Tentukan status lunas/belum
    $payment_status = 'partial';
    if ($new_amount_paid >= $jamaah->total_price) {
        $payment_status = 'paid';
    } elseif ($new_amount_paid == 0) {
        $payment_status = 'unpaid';
    }

    $wpdb->update($wpdb->prefix . 'umh_jamaah', 
        [
            'amount_paid' => $new_amount_paid,
            'payment_status' => $payment_status,
            'package_id' => $package_id // Update paket jika berubah
        ],
        ['id' => $jamaah_id]
    );

    return ['success' => true, 'new_balance' => $new_amount_paid, 'status' => $payment_status];
}