<?php if ( ! defined( 'ABSPATH' ) ) exit; 
// Helper function terbilang sederhana
function penyebut($nilai) {
    $nilai = abs($nilai);
    $huruf = array("", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas");
    $temp = "";
    if ($nilai < 12) {
        $temp = " ". $huruf[$nilai];
    } else if ($nilai <20) {
        $temp = penyebut($nilai - 10). " belas";
    } else if ($nilai < 100) {
        $temp = penyebut($nilai/10)." puluh". penyebut($nilai % 10);
    } else if ($nilai < 200) {
        $temp = " seratus" . penyebut($nilai - 100);
    } else if ($nilai < 1000) {
        $temp = penyebut($nilai/100) . " ratus" . penyebut($nilai % 100);
    } else if ($nilai < 2000) {
        $temp = " seribu" . penyebut($nilai - 1000);
    } else if ($nilai < 1000000) {
        $temp = penyebut($nilai/1000) . " ribu" . penyebut($nilai % 1000);
    } else if ($nilai < 1000000000) {
        $temp = penyebut($nilai/1000000) . " juta" . penyebut($nilai % 1000000);
    }
    return $temp;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Kwitansi #<?php echo $payment->id; ?></title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; color: #333; font-size: 14px; padding: 20px; }
        .kwitansi-box { border: 2px solid #333; padding: 30px; max-width: 800px; margin: 0 auto; position: relative; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px double #ccc; padding-bottom: 15px; margin-bottom: 25px; }
        .company-info h1 { margin: 0; font-size: 24px; color: #1a56db; text-transform: uppercase; }
        .company-info p { margin: 5px 0 0; font-size: 12px; color: #666; }
        .receipt-title { text-align: right; }
        .receipt-title h2 { margin: 0; font-size: 28px; letter-spacing: 2px; }
        .receipt-title span { font-family: monospace; font-size: 16px; color: #555; }
        
        .content-row { margin-bottom: 15px; display: flex; align-items: baseline; }
        .label { width: 150px; font-weight: bold; color: #555; }
        .value { flex: 1; border-bottom: 1px dotted #999; padding-bottom: 5px; position: relative; }
        .value::after { content: ":"; position: absolute; left: -10px; top: 0; font-weight: bold; }
        
        .amount-box { 
            background: #f0f0f0; border: 2px dashed #999; padding: 10px 20px; 
            font-size: 20px; font-weight: bold; font-family: monospace; 
            display: inline-block; margin-top: 20px; border-radius: 8px;
        }
        
        .footer { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
        .notes { font-size: 11px; color: #777; width: 60%; }
        .signature { text-align: center; width: 30%; }
        .sign-space { height: 80px; }
        
        @media print {
            body { padding: 0; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 20px;" class="no-print">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #1a56db; color: white; border: none; border-radius: 5px;">🖨️ Cetak Kwitansi</button>
    </div>

    <div class="kwitansi-box">
        <div class="header">
            <div class="company-info">
                <!-- Ganti Nama Travel Anda Disini -->
                <h1>BANTEN UMROH TRAVEL</h1>
                <p>Jl. Raya Serang - Pandeglang KM 5, Banten<br>Telp: (0254) 123456 | Email: info@banten-umroh.com</p>
            </div>
            <div class="receipt-title">
                <h2>KWITANSI</h2>
                <span>No: KW-<?php echo str_pad($payment->id, 6, '0', STR_PAD_LEFT); ?></span>
            </div>
        </div>

        <div class="content-row">
            <div class="label">Telah terima dari</div>
            <div class="value"><strong><?php echo esc_html(strtoupper($payment->full_name)); ?></strong></div>
        </div>
        
        <div class="content-row">
            <div class="label">Uang Sejumlah</div>
            <div class="value" style="font-style: italic; text-transform: capitalize;">
                <?php echo penyebut($payment->amount) . " rupiah"; ?>
            </div>
        </div>
        
        <div class="content-row">
            <div class="label">Untuk Pembayaran</div>
            <div class="value">
                Pembayaran <?php echo ($payment->status == 'dp_paid') ? 'DP' : 'Cicilan/Pelunasan'; ?> 
                Paket Umroh: <?php echo esc_html($payment->package_name); ?> 
                (Kode Booking: <?php echo $payment->booking_code; ?>)
            </div>
        </div>

        <div class="footer">
            <div class="left-section">
                <div class="amount-box">
                    Rp <?php echo number_format($payment->amount, 0, ',', '.'); ?>,-
                </div>
                <div class="notes">
                    <br><br>
                    <strong>Catatan:</strong><br>
                    - Pembayaran via: <?php echo ucfirst($payment->payment_method); ?><br>
                    - Tanggal Bayar: <?php echo date('d F Y', strtotime($payment->payment_date)); ?><br>
                    - Kwitansi ini sah jika telah dibubuhi cap dan tanda tangan.
                </div>
            </div>
            
            <div class="signature">
                <p>Banten, <?php echo date('d F Y'); ?></p>
                <div class="sign-space"></div>
                <p><strong>( Bagian Keuangan )</strong></p>
            </div>
        </div>
    </div>
    
    <script>window.print();</script>
</body>
</html>