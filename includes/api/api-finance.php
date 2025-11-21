<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Finance {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Transaksi Umum (Cashflow)
        register_rest_route( 'umh/v1', '/finance/transactions', [
            ['methods' => 'GET', 'callback' => [$this, 'get_transactions'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_transaction'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_transactions( $request ) {
        global $wpdb;
        // Gabungkan data pembayaran jamaah dan cashflow manual
        $sql = "SELECT * FROM {$wpdb->prefix}umh_cash_flow ORDER BY transaction_date DESC, id DESC LIMIT 100";
        $results = $wpdb->get_results($sql);
        return rest_ensure_response($results);
    }

    public function create_transaction( $request ) {
        global $wpdb;
        $p = $request->get_json_params();
        
        $type = sanitize_text_field($p['type']); // 'in' atau 'out'
        $category = sanitize_text_field($p['category']); // 'Operasional', 'Gaji', 'Kasbon', 'Lainnya'
        $amount = floatval($p['amount']);
        $desc = sanitize_textarea_field($p['description']);
        $date = $p['transaction_date'] ?: current_time('Y-m-d');
        $ref_id = isset($p['reference_id']) ? intval($p['reference_id']) : 0;

        if($amount <= 0) return new WP_Error('invalid_amount', 'Nominal harus > 0', ['status'=>400]);

        // Hitung Saldo Terakhir (Sederhana)
        $last_balance = $wpdb->get_var("SELECT balance_after FROM {$wpdb->prefix}umh_cash_flow ORDER BY id DESC LIMIT 1") ?: 0;
        $new_balance = ($type === 'in') ? $last_balance + $amount : $last_balance - $amount;

        $wpdb->insert($wpdb->prefix.'umh_cash_flow', [
            'type' => $type,
            'category' => $category,
            'amount' => $amount,
            'transaction_date' => $date,
            'description' => $desc,
            'reference_id' => $ref_id, // Bisa ID karyawan untuk kasbon
            'balance_after' => $new_balance,
            'created_at' => current_time('mysql')
        ]);

        return rest_ensure_response(['message' => 'Transaksi berhasil disimpan', 'balance' => $new_balance]);
    }
}
new UMH_API_Finance();