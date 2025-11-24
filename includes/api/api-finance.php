<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class UMH_API_Finance {
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        // Get All Transactions (Cashflow)
        register_rest_route( 'umh/v1', '/finance/cashflow', [
            ['methods' => 'GET', 'callback' => [$this, 'get_cashflow'], 'permission_callback' => '__return_true'],
        ]);

        // Add Transaction
        register_rest_route( 'umh/v1', '/finance/transaction', [
            ['methods' => 'POST', 'callback' => [$this, 'add_transaction'], 'permission_callback' => '__return_true'],
        ]);

        // Get Jamaah Ledger (Buku Besar Jemaah) - NEW
        register_rest_route( 'umh/v1', '/finance/jamaah/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_jamaah_ledger'], 'permission_callback' => '__return_true'],
        ]);

         // Add Jamaah Payment
         register_rest_route( 'umh/v1', '/finance/payment', [
            ['methods' => 'POST', 'callback' => [$this, 'add_jamaah_payment'], 'permission_callback' => '__return_true'],
        ]);
    }

    public function get_cashflow($request) {
        global $wpdb;
        $type = $request->get_param('type');
        $sql = "SELECT * FROM {$wpdb->prefix}umh_cash_flow";
        if($type) {
            $sql .= $wpdb->prepare(" WHERE type = %s", $type);
        }
        $sql .= " ORDER BY transaction_date DESC LIMIT 100";
        return $wpdb->get_results($sql);
    }

    // NEW: Logic Buku Besar Jemaah
    public function get_jamaah_ledger($request) {
        global $wpdb;
        $jamaah_id = $request['id'];

        // 1. Ambil Data Jemaah & Paket
        $jamaah = $wpdb->get_row($wpdb->prepare(
            "SELECT j.*, p.name as package_name, p.price as package_default_price 
             FROM {$wpdb->prefix}umh_jamaah j 
             LEFT JOIN {$wpdb->prefix}umh_packages p ON j.package_id = p.id 
             WHERE j.id = %d", $jamaah_id
        ));

        if (!$jamaah) return new WP_Error('not_found', 'Jemaah tidak ditemukan', ['status' => 404]);

        // 2. Ambil History Pembayaran
        $payments = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}umh_jamaah_payments 
             WHERE jamaah_id = %d ORDER BY payment_date DESC", 
            $jamaah_id
        ));

        // 3. Hitung Kalkulasi
        $total_price = (float) $jamaah->total_price; // Harga deal dengan jemaah
        if ($total_price == 0 && isset($jamaah->package_default_price)) {
             // Fallback jika harga deal 0, pakai harga default paket (perlu logic tambahan di table packages sebenernya)
             // Untuk sekarang kita asumsikan total_price di table jamaah sudah diisi saat pendaftaran
             $total_price = 0; 
        }

        $total_paid = 0;
        foreach ($payments as $p) {
            if ($p->status == 'paid') {
                $total_paid += (float) $p->amount;
            }
        }

        $remaining = $total_price - $total_paid;
        $progress = ($total_price > 0) ? ($total_paid / $total_price) * 100 : 0;

        return rest_ensure_response([
            'jamaah' => [
                'id' => $jamaah->id,
                'name' => $jamaah->full_name,
                'package' => $jamaah->package_name,
                'passport' => $jamaah->passport_number
            ],
            'summary' => [
                'total_price' => $total_price,
                'total_paid' => $total_paid,
                'remaining' => $remaining,
                'progress' => round($progress, 1)
            ],
            'history' => $payments
        ]);
    }

    public function add_transaction($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        $inserted = $wpdb->insert(
            "{$wpdb->prefix}umh_cash_flow",
            [
                'type' => $params['type'],
                'category' => $params['category'],
                'amount' => $params['amount'],
                'transaction_date' => $params['date'],
                'description' => $params['description'],
                'balance_after' => 0 // Perlu logic saldo berjalan (skip dulu untuk simpel)
            ]
        );

        return $inserted ? ['success' => true] : new WP_Error('db_error', 'Gagal simpan');
    }

    public function add_jamaah_payment($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        // 1. Insert Payment
        $inserted = $wpdb->insert(
            "{$wpdb->prefix}umh_jamaah_payments",
            [
                'jamaah_id' => $params['jamaah_id'],
                'amount' => $params['amount'],
                'payment_date' => $params['date'],
                'payment_method' => $params['method'],
                'status' => 'paid', // Asumsi kasir lgsg terima uang
                'description' => $params['description'],
                'verified_by' => get_current_user_id()
            ]
        );

        if($inserted) {
            // 2. Update Kolom amount_paid di table jamaah agar sinkron
            // Ini opsional karena kita sudah hitung on-the-fly di get_jamaah_ledger, 
            // tapi bagus untuk performa list view jamaah.
            $wpdb->query($wpdb->prepare(
                "UPDATE {$wpdb->prefix}umh_jamaah 
                 SET amount_paid = amount_paid + %f, payment_status = IF(amount_paid >= total_price, 'paid', 'partial')
                 WHERE id = %d",
                $params['amount'], $params['jamaah_id']
            ));

            // 3. Catat juga di Cashflow (Uang Masuk)
            $wpdb->insert(
                "{$wpdb->prefix}umh_cash_flow",
                [
                    'type' => 'in',
                    'category' => 'Pembayaran Jemaah',
                    'amount' => $params['amount'],
                    'transaction_date' => $params['date'],
                    'description' => "Pembayaran dari " . $params['jamaah_name'] . " (" . $params['description'] . ")",
                    'reference_id' => $wpdb->insert_id
                ]
            );

            return ['success' => true, 'id' => $wpdb->insert_id];
        }
        
        return new WP_Error('db_error', 'Gagal simpan pembayaran');
    }
}

new UMH_API_Finance();