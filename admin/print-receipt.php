<?php
/**
 * Template Cetak Kwitansi Pembayaran
 * Akses via: /wp-content/plugins/manajemenjfbanten/admin/print-receipt.php?id=123
 */

// Load WordPress Environment (Adjust path if necessary based on folder structure)
// Cara aman load WP di file terpisah plugin:
$parse_uri = explode( 'wp-content', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );

if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( 'Akses ditolak.' );
}

$payment_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

global $wpdb;
$payment = $wpdb->get_row($wpdb->prepare(
    "SELECT p.*, j.full_name, j.passport_number, pkg.name as package_name 
     FROM {$wpdb->prefix}umh_jamaah_payments p
     JOIN {$wpdb->prefix}umh_jamaah j ON p.jamaah_id = j.id
     LEFT JOIN {$wpdb->prefix}umh_packages pkg ON j.package_id = pkg.id
     WHERE p.id = %d", $payment_id
));

if (!$payment) wp_die('Data pembayaran tidak ditemukan.');

// Format Rupiah
function format_rp($num) {
    return "Rp " . number_format($num, 0, ',', '.');
}

// Terbilang (Simple version)
function terbilang($nilai) {
    $nilai = abs($nilai);
    $huruf = array("", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas");
    $temp = "";
    if ($nilai < 12) {
        $temp = " ". $huruf[$nilai];
    } else if ($nilai <20) {
        $temp = terbilang($nilai - 10). " belas";
    } else if ($nilai < 100) {
        $temp = terbilang($nilai/10)." puluh". terbilang($nilai % 10);
    } else if ($nilai < 200) {
        $temp = " seratus" . terbilang($nilai - 100);
    } else if ($nilai < 1000) {
        $temp = terbilang($nilai/100) . " ratus" . terbilang($nilai % 100);
    } else if ($nilai < 2000) {
        $temp = " seribu" . terbilang($nilai - 1000);
    } else if ($nilai < 1000000) {
        $temp = terbilang($nilai/1000) . " ribu" . terbilang($nilai % 1000);
    } else if ($nilai < 1000000000) {
        $temp = terbilang($nilai/1000000) . " juta" . terbilang($nilai % 1000000);
    }
    return $temp;
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Kwitansi #<?php echo $payment->id; ?></title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 14px; color: #333; }
        .container { width: 800px; margin: 20px auto; padding: 30px; border: 1px solid #ccc; background: #fff; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
        
        .kwitansi-title { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; letter-spacing: 2px; }
        
        .content { line-height: 2.5; } /* Jarak antar baris agar seperti tulisan tangan */
        .row { display: flex; }
        .label { width: 180px; font-weight: bold; }
        .separator { width: 20px; }
        .value { flex: 1; border-bottom: 1px dotted #999; position: relative; }
        
        .amount-box { 
            margin-top: 30px; 
            display: inline-block; 
            padding: 10px 20px; 
            background: #eee; 
            font-size: 20px; 
            font-weight: bold; 
            border: 2px solid #333; 
            border-radius: 10px 0 10px 0;
        }

        .footer { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature { text-align: center; width: 200px; }
        .signature-line { margin-top: 80px; border-top: 1px solid #000; }
        
        @media print {
            .container { border: none; width: 100%; }
            .no-print { display: none; }
        }
    </style>
</head>
<body onload="window.print()">

<div class="container">
    <!-- Ganti dengan Logo/Nama Travel Anda -->
    <div class="header">
        <h1>PT. MANAGEMENT TRAVEL UMRAH</h1>
        <p>Izin Umrah No. 123/2024 | Jl. Raya Banten No. 123, Serang, Banten</p>
        <p>Telp: (0254) 123456 | Email: info@travelumrah.com</p>
    </div>

    <div class="kwitansi-title">KWITANSI PEMBAYARAN</div>

    <div class="content">
        <div class="row">
            <div class="label">No. Kwitansi</div>
            <div class="separator">:</div>
            <div class="value">KW-<?php echo date('Ym', strtotime($payment->payment_date)); ?>-<?php echo str_pad($payment->id, 4, '0', STR_PAD_LEFT); ?></div>
        </div>
        <div class="row">
            <div class="label">Telah Terima Dari</div>
            <div class="separator">:</div>
            <div class="value" style="text-transform: uppercase;"><?php echo $payment->full_name; ?></div>
        </div>
        <div class="row">
            <div class="label">Uang Sejumlah</div>
            <div class="separator">:</div>
            <div class="value" style="font-style: italic; text-transform: capitalize;"># <?php echo trim(terbilang($payment->amount)); ?> Rupiah #</div>
        </div>
        <div class="row">
            <div class="label">Untuk Pembayaran</div>
            <div class="separator">:</div>
            <div class="value"><?php echo $payment->description; ?> (Paket: <?php echo $payment->package_name; ?>)</div>
        </div>
        <div class="row">
            <div class="label">Metode Bayar</div>
            <div class="separator">:</div>
            <div class="value"><?php echo ucfirst($payment->payment_method); ?></div>
        </div>
    </div>

    <div class="amount-box">
        <?php echo format_rp($payment->amount); ?>
    </div>

    <div class="footer">
        <div class="note" style="width: 300px; font-size: 11px; color: #666; margin-top: 20px;">
            <strong>Catatan:</strong><br>
            1. Pembayaran dianggap sah jika sudah ada stempel lunas / tanda tangan kasir.<br>
            2. Simpan kwitansi ini sebagai bukti pembayaran yang sah.
        </div>
        <div class="signature">
            <p>Banten, <?php echo date('d F Y', strtotime($payment->payment_date)); ?></p>
            <p>Penerima,</p>
            <div class="signature-line"><?php echo wp_get_current_user()->display_name; ?></div>
        </div>
    </div>
</div>

</body>
</html>