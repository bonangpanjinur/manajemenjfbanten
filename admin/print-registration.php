<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<!DOCTYPE html>
<html>
<head>
    <title>Formulir Pendaftaran - <?php echo $data->booking_code; ?></title>
    <style>
        body { font-family: "Times New Roman", Times, serif; font-size: 14px; line-height: 1.4; padding: 20px; }
        h1, h2, h3 { font-family: Arial, sans-serif; }
        .container { width: 100%; max-width: 210mm; margin: 0 auto; }
        
        .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
        .header p { margin: 5px 0; font-size: 12px; }
        
        .title { text-align: center; margin-bottom: 30px; }
        .title h2 { text-decoration: underline; margin: 0; font-size: 18px; }
        .title p { margin: 5px 0 0; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        td { vertical-align: top; padding: 5px; }
        .label { width: 180px; font-weight: bold; }
        .sep { width: 10px; }
        .data { border-bottom: 1px dotted #ccc; }

        .section-title { background: #eee; padding: 5px 10px; font-weight: bold; margin: 20px 0 10px; border: 1px solid #ccc; }
        
        .photo-box { 
            width: 3cm; height: 4cm; border: 1px solid #000; 
            float: right; margin: 0 0 20px 20px; 
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; text-align: center; background: #f9f9f9;
        }

        .ttd-area { margin-top: 50px; display: flex; justify-content: space-between; }
        .ttd-box { width: 200px; text-align: center; }
        .ttd-space { height: 80px; }

        @media print {
            .no-print { display: none; }
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 20px;" class="no-print">
        <button onclick="window.print()" style="padding: 10px 20px; background: #1a56db; color: white; border: none; cursor: pointer; border-radius: 5px;">🖨️ Cetak Formulir</button>
    </div>

    <div class="container">
        <div class="header">
            <h1>PT. BANTEN UMROH TRAVEL</h1>
            <p>PPIU No. 123 Tahun 2024 | Penyelenggara Perjalanan Ibadah Umroh & Haji Khusus</p>
            <p>Jl. Raya Serang - Pandeglang KM 5, Banten | Telp: (0254) 123456</p>
        </div>

        <div class="title">
            <h2>FORMULIR PENDAFTARAN UMROH</h2>
            <p>Kode Booking: <strong><?php echo $data->booking_code; ?></strong></p>
        </div>

        <div class="photo-box">
            Pas Foto<br>4x6<br>Background Putih
        </div>

        <div class="section-title">A. DATA PRIBADI JAMAAH</div>
        <table>
            <tr>
                <td class="label">Nama Lengkap</td><td class="sep">:</td>
                <td class="data"><strong><?php echo strtoupper($data->full_name); ?></strong></td>
            </tr>
            <tr>
                <td class="label">NIK (KTP)</td><td class="sep">:</td>
                <td class="data"><?php echo $data->nik; ?></td>
            </tr>
            <tr>
                <td class="label">Jenis Kelamin</td><td class="sep">:</td>
                <td class="data"><?php echo ($data->gender == 'L') ? 'Laki-laki' : 'Perempuan'; ?></td>
            </tr>
            <tr>
                <td class="label">Tempat, Tgl Lahir</td><td class="sep">:</td>
                <td class="data"><?php echo date('d F Y', strtotime($data->birth_date)); ?></td>
            </tr>
            <tr>
                <td class="label">No. Telepon / WA</td><td class="sep">:</td>
                <td class="data"><?php echo $data->phone_number; ?></td>
            </tr>
            <tr>
                <td class="label">Alamat Rumah</td><td class="sep">:</td>
                <td class="data">
                    <?php 
                        if(is_array($data->address_details)) {
                            echo $data->address_details['street'] . ', ' . $data->address_details['city'];
                        } else {
                            echo "-";
                        }
                    ?>
                </td>
            </tr>
        </table>

        <div class="section-title">B. DOKUMEN PERJALANAN</div>
        <table>
            <tr>
                <td class="label">Nomor Paspor</td><td class="sep">:</td>
                <td class="data"><?php echo $data->passport_number ? $data->passport_number : '.........................'; ?></td>
            </tr>
            <tr>
                <td class="label">Tgl Dikeluarkan</td><td class="sep">:</td>
                <td class="data">.........................</td>
            </tr>
             <tr>
                <td class="label">Tgl Habis Berlaku</td><td class="sep">:</td>
                <td class="data">.........................</td>
            </tr>
             <tr>
                <td class="label">Kantor Imigrasi</td><td class="sep">:</td>
                <td class="data">.........................</td>
            </tr>
        </table>

        <div class="section-title">C. PAKET YANG DIAMBIL</div>
        <table>
            <tr>
                <td class="label">Nama Paket</td><td class="sep">:</td>
                <td class="data"><strong><?php echo $data->package_name; ?></strong></td>
            </tr>
            <tr>
                <td class="label">Tanggal Keberangkatan</td><td class="sep">:</td>
                <td class="data"><?php echo date('d F Y', strtotime($data->departure_date)); ?></td>
            </tr>
            <tr>
                <td class="label">Maskapai</td><td class="sep">:</td>
                <td class="data"><?php echo $data->airline_name; ?></td>
            </tr>
             <tr>
                <td class="label">Tipe Kamar</td><td class="sep">:</td>
                <td class="data"><?php echo $data->selected_room_type; ?></td>
            </tr>
            <tr>
                <td class="label">Harga Paket</td><td class="sep">:</td>
                <td class="data">Rp <?php echo number_format($data->agreed_price, 0, ',', '.'); ?></td>
            </tr>
        </table>

        <div class="ttd-area">
            <div class="ttd-box">
                <p>Petugas Pendaftar,</p>
                <div class="ttd-space"></div>
                <p>( ............................. )</p>
            </div>
            <div class="ttd-box">
                <p>Banten, <?php echo date('d F Y'); ?><br>Calon Jamaah,</p>
                <div class="ttd-space"></div>
                <p><strong>( <?php echo strtoupper($data->full_name); ?> )</strong></p>
            </div>
        </div>
    </div>
</body>
</html>