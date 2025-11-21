<?php
if (!defined('ABSPATH')) exit;

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_API_Finance extends UMH_CRUD_Controller {
    public function __construct() {
        // Kita gunakan tabel cash flow sebagai tabel utama controller ini
        parent::__construct('umh_cash_flow');
    }

    public function register_routes() {
        // Route Standar CRUD Cash Flow
        register_rest_route('umh/v1', '/finance/transactions', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_items'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'create_item'], // Create manual transaction
                'permission_callback' => [$this, 'check_permission'],
            ]
        ]);

        // Route Khusus: Summary / Buku Besar
        register_rest_route('umh/v1', '/finance/summary', [
            'methods' => 'GET',
            'callback' => [$this, 'get_finance_summary'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }

    // Override get_items untuk filter tanggal & kategori
    public function get_items($request) {
        global $wpdb;
        $params = $request->get_params();
        $where = "WHERE 1=1";
        $args = [];

        if (isset($params['start_date']) && isset($params['end_date'])) {
            $where .= " AND transaction_date BETWEEN %s AND %s";
            $args[] = $params['start_date'];
            $args[] = $params['end_date'];
        }

        if (isset($params['type'])) { // 'in' or 'out'
            $where .= " AND type = %s";
            $args[] = $params['type'];
        }

        $query = "SELECT * FROM {$this->table_name} $where ORDER BY transaction_date DESC, id DESC";
        
        if (!empty($args)) {
            $items = $wpdb->get_results($wpdb->prepare($query, $args));
        } else {
            $items = $wpdb->get_results($query);
        }

        return rest_ensure_response($items);
    }

    public function prepare_item_for_database($request) {
        // Validasi ketat agar data tersimpan
        $amount = isset($request['amount']) ? floatval($request['amount']) : 0;
        if ($amount <= 0) {
            return new WP_Error('invalid_amount', 'Jumlah harus lebih dari 0', ['status' => 400]);
        }

        $data = [
            'type' => sanitize_text_field($request['type']), // 'in' or 'out'
            'category' => sanitize_text_field($request['category']),
            'amount' => $amount,
            'transaction_date' => !empty($request['transaction_date']) ? sanitize_text_field($request['transaction_date']) : current_time('Y-m-d'),
            'description' => sanitize_textarea_field($request['description']),
            'reference_id' => isset($request['reference_id']) ? intval($request['reference_id']) : 0,
        ];

        return $data;
    }

    // Endpoint Dashboard Keuangan
    public function get_finance_summary($request) {
        global $wpdb;
        
        // Hitung Total Masuk
        $income = $wpdb->get_var("SELECT SUM(amount) FROM {$this->table_name} WHERE type = 'in'");
        
        // Hitung Total Keluar
        $expense = $wpdb->get_var("SELECT SUM(amount) FROM {$this->table_name} WHERE type = 'out'");

        // Saldo Akhir
        $balance = floatval($income) - floatval($expense);

        // Transaksi Terakhir (5)
        $recent = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY transaction_date DESC LIMIT 5");

        return rest_ensure_response([
            'total_income' => floatval($income),
            'total_expense' => floatval($expense),
            'net_balance' => $balance,
            'recent_transactions' => $recent
        ]);
    }
}