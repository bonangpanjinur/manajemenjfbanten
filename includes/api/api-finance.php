<?php
/**
 * API Handler untuk Modul Keuangan
 * Menangani Arus Kas (Cash Flow) dan Pembayaran Jamaah
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_API_Finance {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $namespace = 'umh/v1';

        // --- CASH FLOW (ARUS KAS) ---
        register_rest_route( $namespace, '/finance/cash-flow', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_cash_flow' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/finance/cash-flow', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array( $this, 'create_cash_transaction' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // --- STATISTIK KEUANGAN ---
        register_rest_route( $namespace, '/finance/stats', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_finance_stats' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        // --- PEMBAYARAN JAMAAH ---
        register_rest_route( $namespace, '/finance/payments', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_jamaah_payments' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( $namespace, '/finance/payments', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array( $this, 'create_jamaah_payment' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    public function check_permission() {
        return current_user_can( 'manage_options' );
    }

    // --- 1. CASH FLOW LOGIC ---

    public function get_cash_flow( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_cash_flow';
        
        $where = "WHERE 1=1";
        $args = array();

        // Filter by Type (in/out)
        if ( $request->get_param( 'type' ) ) {
            $where .= " AND type = %s";
            $args[] = sanitize_text_field( $request->get_param( 'type' ) );
        }

        // Filter by Date Range
        if ( $request->get_param( 'start_date' ) && $request->get_param( 'end_date' ) ) {
            $where .= " AND transaction_date BETWEEN %s AND %s";
            $args[] = $request->get_param( 'start_date' );
            $args[] = $request->get_param( 'end_date' );
        }

        $query = "SELECT * FROM $table $where ORDER BY transaction_date DESC, id DESC LIMIT 100";
        
        if ( ! empty( $args ) ) {
            $results = $wpdb->get_results( $wpdb->prepare( $query, $args ) );
        } else {
            $results = $wpdb->get_results( $query );
        }

        return rest_ensure_response( $results );
    }

    public function create_cash_transaction( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_cash_flow';

        $type = sanitize_text_field( $request->get_param( 'type' ) ); // 'in' or 'out'
        $amount = (float) $request->get_param( 'amount' );
        $category = sanitize_text_field( $request->get_param( 'category' ) );
        
        if ( $amount <= 0 ) {
            return new WP_Error( 'invalid_amount', 'Nominal harus lebih dari 0', array( 'status' => 400 ) );
        }

        // Validasi Saldo jika Pengeluaran
        if ( $type === 'out' ) {
            $current_balance = $this->calculate_current_balance();
            if ( $amount > $current_balance ) {
                return new WP_Error( 'insufficient_funds', 'Saldo kas tidak mencukupi. Sisa saldo: ' . number_format($current_balance), array( 'status' => 400 ) );
            }
        }

        $inserted = $wpdb->insert(
            $table,
            array(
                'type' => $type,
                'category' => $category,
                'amount' => $amount,
                'transaction_date' => $request->get_param( 'transaction_date' ) ?: current_time( 'mysql' ),
                'description' => sanitize_textarea_field( $request->get_param( 'description' ) ),
                'proof_file' => esc_url_raw( $request->get_param( 'proof_file' ) ),
                'balance_after' => 0 // Placeholder, logic saldo kompleks bisa ditambahkan jika perlu history saldo per baris
            )
        );

        if ( $inserted ) {
            return rest_ensure_response( array( 'message' => 'Transaksi berhasil dicatat' ) );
        }
        return new WP_Error( 'db_error', 'Gagal menyimpan transaksi', array( 'status' => 500 ) );
    }

    // --- 2. JAMAAH PAYMENTS LOGIC ---

    public function get_jamaah_payments( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_payments';
        $table_jamaah = $wpdb->prefix . 'umh_jamaah';
        
        // Join untuk dapat nama jamaah
        $query = "
            SELECT p.*, j.full_name, j.passport_number 
            FROM $table p
            JOIN $table_jamaah j ON p.jamaah_id = j.id
            ORDER BY p.payment_date DESC
        ";

        $results = $wpdb->get_results( $query );
        return rest_ensure_response( $results );
    }

    public function create_jamaah_payment( $request ) {
        global $wpdb;
        $table_payments = $wpdb->prefix . 'umh_payments';
        $table_jamaah = $wpdb->prefix . 'umh_jamaah';
        $table_cash = $wpdb->prefix . 'umh_cash_flow';

        $jamaah_id = (int) $request->get_param( 'jamaah_id' );
        $amount = (float) $request->get_param( 'amount' );
        $date = $request->get_param( 'payment_date' ) ?: date('Y-m-d');
        $method = sanitize_text_field( $request->get_param( 'payment_method' ) );

        if ( $amount <= 0 ) return new WP_Error( 'invalid', 'Nominal salah', array( 'status' => 400 ) );

        // 1. Ambil Data Jamaah Saat Ini
        $jamaah = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_jamaah WHERE id = %d", $jamaah_id ) );
        if ( ! $jamaah ) return new WP_Error( 'not_found', 'Jamaah tidak ditemukan', array( 'status' => 404 ) );

        // 2. Insert Riwayat Pembayaran
        $wpdb->insert(
            $table_payments,
            array(
                'jamaah_id' => $jamaah_id,
                'amount' => $amount,
                'payment_date' => $date,
                'payment_method' => $method,
                'proof_file' => esc_url_raw( $request->get_param( 'proof_file' ) ),
                'notes' => sanitize_textarea_field( $request->get_param( 'notes' ) ),
                'verified_by' => get_current_user_id()
            )
        );
        $payment_id = $wpdb->insert_id;

        // 3. Update Status Jamaah
        $new_total_paid = (float)$jamaah->total_paid + $amount;
        $price = (float)$jamaah->package_price;
        
        $new_status = 'partial';
        if ( $new_total_paid >= $price ) {
            $new_status = 'lunas';
        } else if ( $new_total_paid > 0 ) {
            $new_status = 'partial';
        }

        $wpdb->update(
            $table_jamaah,
            array( 
                'total_paid' => $new_total_paid,
                'payment_status' => $new_status 
            ),
            array( 'id' => $jamaah_id )
        );

        // 4. Catat Otomatis di Cash Flow (Pemasukan)
        $wpdb->insert(
            $table_cash,
            array(
                'type' => 'in',
                'category' => 'Pembayaran Jamaah',
                'amount' => $amount,
                'transaction_date' => $date,
                'description' => "Pembayaran dari {$jamaah->full_name} (ID: {$jamaah_id}) via $method",
                'reference_id' => $payment_id
            )
        );

        return rest_ensure_response( array( 
            'message' => 'Pembayaran berhasil disimpan',
            'new_status' => $new_status,
            'new_total' => $new_total_paid
        ) );
    }

    // --- 3. HELPERS & STATS ---

    public function get_finance_stats() {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_cash_flow';

        $in = $wpdb->get_var( "SELECT SUM(amount) FROM $table WHERE type = 'in'" );
        $out = $wpdb->get_var( "SELECT SUM(amount) FROM $table WHERE type = 'out'" );
        
        $balance = (float)$in - (float)$out;

        return rest_ensure_response( array(
            'total_in' => (float)$in,
            'total_out' => (float)$out,
            'balance' => $balance
        ) );
    }

    private function calculate_current_balance() {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_cash_flow';
        $in = $wpdb->get_var( "SELECT SUM(amount) FROM $table WHERE type = 'in'" );
        $out = $wpdb->get_var( "SELECT SUM(amount) FROM $table WHERE type = 'out'" );
        return (float)$in - (float)$out;
    }

}

new UMH_API_Finance();