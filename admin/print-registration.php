<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Formulir Pendaftaran - <?php echo isset($data->booking_code) ? esc_html($data->booking_code) : 'Draft'; ?></title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            background-color: #525659; /* Latar gelap ala PDF Viewer */
            margin: 0;
            padding: 20px;
            -webkit-print-color-adjust: exact;
        }
        .paper {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            padding: 20mm;
            box-sizing: border-box;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
            position: relative;
        }
        
        /* Typography */
        h1 { font-size: 22pt; font-weight: bold; text-align: center; margin: 0; text-transform: uppercase; font-family: Arial, sans-serif; color: #000; }
        h2 { font-size: 16pt; font-weight: bold; text-align: center; margin: 5px 0; font-family: Arial, sans-serif; color: #000; }
        h3 { font-size: 11pt; font-weight: bold; text-decoration: underline; margin-bottom: 8px; margin-top: 25px; text-transform: uppercase; }
        p, td { font-size: 11pt; line-height: 1.4; color: #000; }
        
        /* Layout Elements */
        .header { 
            border-bottom: 3px double #000; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
            text-align: center;
        }
        .company-info p { font-size: 10pt; margin: 2px 0; }
        
        .doc-title {
            text-align: center;
            margin: 30px 0;
            border: 2px solid #000;
            padding: 8px;
            background: #f0f0f0;
        }
        .doc-title h2 { margin: 0; text-decoration: none; }

        /* Data Tables */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
        }
        table.data-table td {
            padding: 6px 4px;
            vertical-align: top;
        }
        .col-label { width: 180px; font-weight: bold; }
        .col-sep { width: 10px; text-align: center; }
        .col-val { border-bottom: 1px dotted #999; }

        /* Photo Box */
        .photo-area {
            position: absolute;
            top: 60mm;
            right: 20mm;
            width: 3cm;
            height: 4cm;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 9pt;
            color: #666;
            background: #f9f9f9;
        }

        /* Signatures */
        .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            page-break-inside: avoid;
        }
        .sig-box {
            width: 220px;
            text-align: center;
        }
        .sig-space {
            height: 80px;
        }
        .sig-name {
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
        }

        /* Screen Only Tools */
        .no-print {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .btn {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            color: #374151;
            font-family: sans-serif;
            font-size: 14px;
            transition: all 0.2s;
        }
        .btn:hover { background: #e5e7eb; }
        .btn-print { background: #2563eb; color: white; border-color: #2563eb; }
        .btn-print:hover { background: #1d4ed8; }

        @media print {
            body { background: none; padding: 0; }
            .paper { margin: 0; box-shadow: none; width: 100%; padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>

    <!-- Tombol Print (Hanya tampil di layar) -->
    <div class="no-print">
        <span style="font-family: sans-serif; font-size: 12px; color: #666;">Preview Mode</span>
        <button onclick="window.print()" class="btn btn-print">🖨️ Cetak / Simpan PDF</button>
        <button onclick="window.close()" class="btn">Tutup</button>
    </div>

    <div class="paper">
        <!-- Header / Kop Surat -->
        <div class="header">
            <div class="company-info">
                <h1>PT. JANNAH FIRDAUS BANTEN</h1>
                <p>Izin PPIU No. 123/2024 | Penyelenggara Resmi Umroh & Haji Khusus</p>
                <p>Jl. Raya Serang - Pandeglang KM 5, Banten | Telp: (0254) 123456 | Email: info@jfbanten.com</p>
            </div>
        </div>

        <!-- Judul Dokumen -->
        <div class="doc-title">
            <h2>FORMULIR PENDAFTARAN UMROH</h2>
            <p style="margin-top:5px; font-size: 10pt;">NO. REGISTRASI: <strong><?php echo isset($data->booking_code) ? esc_html($data->booking_code) : '-'; ?></strong></p>
        </div>

        <!-- Area Foto -->
        <div class="photo-area">
            Pas Foto<br>4 x 6<br>Warna<br>(Background Putih)
        </div>

        <!-- Konten Data -->
        <h3>A. DATA PRIBADI JAMAAH</h3>
        <table class="data-table">
            <tr>
                <td class="col-label">Nama Lengkap (KTP)</td><td class="col-sep">:</td>
                <td class="col-val"><strong><?php echo isset($data->full_name) ? esc_html(strtoupper($data->full_name)) : ''; ?></strong></td>
            </tr>
            <tr>
                <td class="col-label">Nomor Induk (NIK)</td><td class="col-sep">:</td>
                <td class="col-val"><?php echo isset($data->nik) ? esc_html($data->nik) : '-'; ?></td>
            </tr>
            <tr>
                <td class="col-label">Jenis Kelamin</td><td class="col-sep">:</td>
                <td class="col-val"><?php echo (isset($data->gender) && $data->gender == 'L') ? 'Laki-laki' : 'Perempuan'; ?></td>
            </tr>
            <tr>
                <td class="col-label">Tempat, Tgl Lahir</td><td class="col-sep">:</td>
                <td class="col-val">
                    <?php echo isset($data->birth_date) ? date('d F Y', strtotime($data->birth_date)) : '-'; ?>
                </td>
            </tr>
            <tr>
                <td class="col-label">No. Telepon / WA</td><td class="col-sep">:</td>
                <td class="col-val"><?php echo isset($data->phone_number) ? esc_html($data->phone_number) : '-'; ?></td>
            </tr>
            <tr>
                <td class="col-label">Alamat Rumah</td><td class="col-sep">:</td>
                <td class="col-val">
                    <?php 
                        if(isset($data->address_details) && is_array($data->address_details)) {
                            echo esc_html(($data->address_details['detail'] ?? '') . ' ' . ($data->address_details['city'] ?? ''));
                        } else {
                            echo "-";
                        }
                    ?>
                </td>
            </tr>
        </table>

        <h3>B. DOKUMEN PERJALANAN (PASPOR)</h3>
        <table class="data-table">
            <tr>
                <td class="col-label">Nomor Paspor</td><td class="col-sep">:</td>
                <td class="col-val"><?php echo !empty($data->passport_number) ? esc_html($data->passport_number) : '.........................'; ?></td>
            </tr>
            <tr>
                <td class="col-label">Tanggal Dikeluarkan</td><td class="col-sep">:</td>
                <td class="col-val">
                    <?php echo !empty($data->passport_issued) ? date('d F Y', strtotime($data->passport_issued)) : '.........................'; ?>
                </td>
            </tr>
            <tr>
                <td class="col-label">Berlaku Hingga</td><td class="col-sep">:</td>
                <td class="col-val">
                    <?php echo !empty($data->passport_expiry) ? date('d F Y', strtotime($data->passport_expiry)) : '.........................'; ?>
                </td>
            </tr>
        </table>

        <h3>C. PAKET YANG DIPILIH</h3>
        <table class="data-table">
            <tr>
                <td class="col-label">Nama Paket</td><td class="col-sep">:</td>
                <td class="col-val"><strong><?php echo isset($data->package_name) ? esc_html($data->package_name) : '-'; ?></strong></td>
            </tr>
            <tr>
                <td class="col-label">Jadwal Keberangkatan</td><td class="col-sep">:</td>
                <td class="col-val"><?php echo isset($data->departure_date) ? date('d F Y', strtotime($data->departure_date)) : '-'; ?></td>
            </tr>
            <tr>
                <td class="col-label">Maskapai Penerbangan</td><td class="col-sep">:</td>
                <td class="col-val"><?php echo isset($data->airline_name) ? esc_html($data->airline_name) : '-'; ?></td>
            </tr>
            <tr>
                <td class="col-label">Tipe Kamar</td><td class="col-sep">:</td>
                <td class="col-val"><?php echo isset($data->selected_room_type) ? esc_html($data->selected_room_type) : '-'; ?></td>
            </tr>
            <tr>
                <td class="col-label">Harga Paket</td><td class="col-sep">:</td>
                <td class="col-val">Rp <?php echo isset($data->agreed_price) ? number_format($data->agreed_price, 0, ',', '.') : '0'; ?>,-</td>
            </tr>
        </table>

        <!-- Tanda Tangan -->
        <div class="signature-row">
            <div class="sig-box">
                <p>Petugas Pendaftar,</p>
                <div class="sig-space"></div>
                <p class="sig-name">( ..................................... )</p>
            </div>
            <div class="sig-box">
                <p>Banten, <?php echo date('d F Y'); ?><br>Calon Jamaah,</p>
                <div class="sig-space"></div>
                <p class="sig-name">( <?php echo isset($data->full_name) ? esc_html(strtoupper($data->full_name)) : '.........................'; ?> )</p>
            </div>
        </div>
        
        <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 5px; font-size: 9pt; text-align: center; font-style: italic;">
            Dicetak otomatis oleh Sistem Informasi Manajemen Umroh - JF Banten pada <?php echo date('d/m/Y H:i'); ?>
        </div>
    </div>
</body>
</html>