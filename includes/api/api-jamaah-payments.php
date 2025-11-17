<?php
// File: includes/api/api-jamaah-payments.php
// API khusus untuk mengelola riwayat pembayaran per jemaah.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

add_action('rest_api_init', 'umh_register_jamaah_payments_routes');

function umh_register_jamaah_payments_routes() {
    $namespace = 'umh/v1';

    // Izin: Staf Keuangan, Admin, dan Owner
    // --- PERBAIKAN: Menyimpan array role, bukan memanggil fungsi ---
    $permissions_roles = ['owner', 'admin_staff', 'finance_staff'];
    // --- AKHIR PERBAIKAN ---

    // Endpoint: GET /jamaah/{jamaah_id}/payments
    // Mendapatkan semua riwayat pembayaran untuk satu jemaah
    register_rest_route($namespace, '/jamaah/(?P<jamaah_id>\d+)/payments', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_get_jamaah_payments',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($permissions_roles) {
                return umh_check_api_permission($request, $permissions_roles);
            },
            // --- AKHIR PERBAIKAN ---
        ],
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'umh_add_jamaah_payment',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($permissions_roles) {
                return umh_check_api_permission($request, $permissions_roles);
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);

    // Endpoint: PUT /jamaah/payments/{payment_id}
    // Memverifikasi, menolak, atau mengedit pembayaran
    register_rest_route($namespace, '/jamaah/payments/(?P<payment_id>\d+)', [
        [
            'methods' => WP_REST_Server::EDITABLE, // PUT/PATCH
            'callback' => 'umh_update_jamaah_payment_entry',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($permissions_roles) {
                return umh_check_api_permission($request, $permissions_roles);
            },
            // --- AKHIR PERBAIKAN ---
        ],
        [
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => 'umh_delete_jamaah_payment_entry',
            // --- PERBAIKAN: Bungkus panggilan dalam anonymous function ---
            'permission_callback' => function($request) use ($permissions_roles) {
                return umh_check_api_permission($request, $permissions_roles);
            },
            // --- AKHIR PERBAIKAN ---
        ],
    ]);
}

// Callback: GET /jamaah/{jamaah_id}/payments
function umh_get_jamaah_payments(WP_REST_Request $request) {
    global $wpdb;
    $jamaah_id = (int) $request['jamaah_id'];
    $table_name = $wpdb->prefix . 'umh_jamaah_payments';

    $results = $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM $table_name WHERE jamaah_id = %d ORDER BY payment_date DESC", $jamaah_id)
    );

    return new WP_REST_Response($results, 200);
}

// Callback: POST /jamaah/{jamaah_id}/payments
function umh_add_jamaah_payment(WP_REST_Request $request) {
    global $wpdb;
    $jamaah_id = (int) $request['jamaah_id'];
    $params = $request->get_json_params();
    
    $table_name = $wpdb->prefix . 'umh_jamaah_payments';
    
    $data = [
        'jamaah_id' => $jamaah_id,
        'payment_date' => sanitize_text_field($params['payment_date']),
        'amount' => (float) $params['amount'],
        'description' => sanitize_text_field($params['description']),
        'proof_of_payment_url' => esc_url_raw($params['proof_of_payment_url'] ?? null),
        'status' => 'pending', // Pembayaran baru selalu pending menunggu verifikasi
        'created_at' => current_time('mysql'),
        'updated_at' => current_time('mysql'),
    ];

    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        return new WP_Error('db_error', 'Gagal menambahkan pembayaran.', ['status' => 500]);
    }

    $new_id = $wpdb->insert_id;
    
    // Jangan update total amount_paid di sini. Tunggu sampai status 'verified'.
    
    $new_payment = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $new_id));
    return new WP_REST_Response($new_payment, 201);
}

// Callback: PUT /jamaah/payments/{payment_id}
function umh_update_jamaah_payment_entry(WP_REST_Request $request) {
    global $wpdb;
    $payment_id = (int) $request['payment_id'];
    $params = $request->get_json_params();
    $table_name = $wpdb->prefix . 'umh_jamaah_payments';

    $data = [];
    $formats = [];

    // Ambil data pembayaran yang ada
    $payment = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $payment_id));
    if (!$payment) {
        return new WP_Error('not_found', 'Data pembayaran tidak ditemukan.', ['status' => 404]);
    }

    if (isset($params['status'])) {
        $data['status'] = sanitize_text_field($params['status']);
        $formats[] = '%s';
    }
    if (isset($params['description'])) {
        $data['description'] = sanitize_text_field($params['description']);
        $formats[] = '%s';
    }
    if (isset($params['amount'])) {
        $data['amount'] = (float) $params['amount'];
        $formats[] = '%f';
    }

    if (empty($data)) {
        return new WP_Error('bad_request', 'Tidak ada data untuk diupdate.', ['status' => 400]);
    }

    $data['updated_at'] = current_time('mysql');
    $formats[] = '%s';

    $result = $wpdb->update($table_name, $data, ['id' => $payment_id], $formats, ['%d']);

    if ($result === false) {
        return new WP_Error('db_error', 'Gagal mengupdate pembayaran.', ['status' => 500]);
    }

    // (PENTING) Update total `amount_paid` di tabel jemaah
    umh_recalculate_jamaah_paid_amount($payment->jamaah_id);

    $updated_payment = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $payment_id));
    return new WP_REST_Response($updated_payment, 200);
}

// Callback: DELETE /jamaah/payments/{payment_id}
function umh_delete_jamaah_payment_entry(WP_REST_Request $request) {
    global $wpdb;
    $payment_id = (int) $request['payment_id'];
    $table_name = $wpdb->prefix . 'umh_jamaah_payments';

    // Ambil data pembayaran yang ada
    $payment = $wpdb->get_row($wpdb->prepare("SELECT jamaah_id FROM $table_name WHERE id = %d", $payment_id));
    if (!$payment) {
        return new WP_Error('not_found', 'Data pembayaran tidak ditemukan.', ['status' => 404]);
    }
    
    $jamaah_id = $payment->jamaah_id;

    $result = $wpdb->delete($table_name, ['id' => $payment_id], ['%d']);

    if ($result === false) {
        return new WP_Error('db_error', 'Gagal menghapus pembayaran.', ['status' => 500]);
    }

    // (PENTING) Update total `amount_paid` di tabel jemaah
    umh_recalculate_jamaah_paid_amount($jamaah_id);

    return new WP_REST_Response(['message' => 'Pembayaran berhasil dihapus.'], 200);
}

// Fungsi Helper untuk menghitung ulang total pembayaran jemaah
function umh_recalculate_jamaah_paid_amount($jamaah_id) {
    global $wpdb;
    $payments_table = $wpdb->prefix . 'umh_jamaah_payments';
    $jamaah_table = $wpdb->prefix . 'umh_jamaah';

    // Hitung total hanya dari pembayaran yang 'verified'
    // --- PERBAIKAN: Menggunakan status 'paid' (bukan 'verified') ---
    $total_paid = (float) $wpdb->get_var(
        $wpdb->prepare(
            "SELECT SUM(amount) FROM $payments_table WHERE jamaah_id = %d AND status = 'paid'",
            $jamaah_id
        )
    );
    // --- AKHIR PERBAIKAN ---

    // Dapatkan total harga paket
    $total_price = (float) $wpdb->get_var(
        $wpdb->prepare("SELECT total_price FROM $jamaah_table WHERE id = %d", $jamaah_id)
    );

    // Tentukan status pembayaran baru
    // --- PERBAIKAN: Menggunakan 'payment_status' dari tabel jamaah ---
    $payment_status = 'pending';
    if ($total_paid > 0) {
        $payment_status = 'cicil'; // atau 'dp'
    }
    if ($total_price > 0 && $total_paid >= $total_price) {
        $payment_status = 'lunas';
    }
     if ($total_paid == 0) {
        $payment_status = 'pending';
    }
    // --- AKHIR PERBAIKAN ---

    // Update tabel jemaah
    $wpdb->update(
        $jamaah_table,
        ['amount_paid' => $total_paid, 'payment_status' => $payment_status],
        ['id' => $jamaah_id],
        ['%f', '%s'],
        ['%d']
    );
}