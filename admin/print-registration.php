<?php
// File: admin/print-registration.php
// Halaman untuk formulir pendaftaran offline (cetak)

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Callback untuk me-render halaman cetak.
 * Ini adalah halaman tersembunyi yang hanya diakses via link/menu tertentu.
 */
function umh_render_print_registration_page() {
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Formulir Pendaftaran Jemaah</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            background-color: #fff;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 25px;
            border-radius: 8px;
        }
        h1, h2 {
            text-align: center;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-top: 0;
        }
        h2 {
            font-size: 1.2em;
            background-color: #f9f9f9;
            padding: 10px;
            margin-bottom: 20px;
        }
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9em;
        }
        .input-box {
            border: 1px solid #ccc;
            height: 35px;
            width: 100%;
            box-sizing: border-box; /* Penting untuk padding */
            border-radius: 4px;
            padding-left: 10px;
        }
        .textarea-box {
            border: 1px solid #ccc;
            height: 80px;
            width: 100%;
            box-sizing: border-box;
            border-radius: 4px;
            padding: 10px;
            font-family: Arial, sans-serif;
        }
        .checklist-group {
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 5px;
        }
        .check-item {
            margin-bottom: 10px;
        }
        .check-box {
            width: 20px;
            height: 20px;
            border: 1px solid #999;
            display: inline-block;
            margin-right: 10px;
            vertical-align: middle;
        }
        .check-item label {
            display: inline-block;
            font-weight: normal;
        }
        .footer {
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .signature-box {
            border: 1px dashed #ccc;
            height: 100px;
            margin-top: 10px;
            padding: 10px;
            text-align: center;
            color: #999;
        }
        .print-button {
            display: block;
            width: 100%;
            padding: 15px;
            background-color: #007cba;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1.2em;
            cursor: pointer;
            text-align: center;
            margin: 20px auto;
        }

        @media print {
            body {
                margin: 0;
            }
            .container {
                border: none;
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }
            .print-button {
                display: none;
            }
            .input-box {
                border-bottom: 1px solid #999;
                border-top: none;
                border-left: none;
                border-right: none;
                border-radius: 0;
                height: 25px;
            }
            .textarea-box {
                 border-bottom: 1px solid #999;
                border-top: none;
                border-left: none;
                border-right: none;
                border-radius: 0;
                height: 60px;
            }
            .check-box {
                border: 1px solid #333;
            }
            .signature-box {
                border: none;
                border-bottom: 1px solid #333;
                height: 80px;
            }
             .form-grid {
                /* Paksa agar tidak terpotong antar halaman */
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>Formulir Pendaftaran Jemaah</h1>

        <button class="print-button" onclick="window.print()">Cetak Formulir</button>
        
        <form>
            <h2>A. Data Paket</h2>
            <div class="form-grid">
                <div class="form-group">
                    <label>Paket yang Dipilih:</label>
                    <div class="input-box"></div>
                </div>
                <div class="form-group">
                    <label>Tanggal Keberangkatan:</label>
                    <div class="input-box"></div>
                </div>
                 <div class="form-group">
                    <label>Harga Paket (Rp):</label>
                    <div class="input-box"></div>
                </div>
                 <div class="form-group">
                    <label>Tipe Kamar:</label>
                    <div class="input-box"></div>
                </div>
            </div>

            <h2>B. Data Pribadi Jemaah</h2>
            <div class="form-grid">
                <div class="form-group full-width">
                    <label>Nama Lengkap (Sesuai Paspor):</label>
                    <div class="input-box"></div>
                </div>
                <div class="form-group">
                    <label>No. KTP / NIK:</label>
                    <div class="input-box"></div>
                </div>
                <div class="form-group">
                    <label>No. Paspor:</label>
                    <div class="input-box"></div>
                </div>
                <div class="form-group">
                    <label>Tanggal Lahir:</label>
                    <div class="input-box"></div>
                </div>
                <div class="form-group">
                    <label>Jenis Kelamin:</label>
                    <div class="input-box"></div>
                </div>
                <div class="form-group">
                    <label>No. Telepon / HP (WhatsApp):</label>
                    <div class="input-box"></div>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <div class="input-box"></div>
                </div>
                <div class="form-group full-width">
                    <label>Alamat Lengkap (Sesuai KTP):</label>
                    <div class="textarea-box"></div>
                </div>
            </div>

            <h2>C. Kelengkapan Dokumen (Diserahkan ke Admin)</h2>
            <div class="checklist-group">
                <div class="check-item">
                    <span class="check-box"></span>
                    <label>Fotokopi KTP</label>
                </div>
                 <div class="check-item">
                    <span class="check-box"></span>
                    <label>Fotokopi Kartu Keluarga (KK)</label>
                </div>
                 <div class="check-item">
                    <span class="check-box"></span>
                    <label>Paspor Asli (Masih berlaku min. 8 bulan)</label>
                </div>
                 <div class="check-item">
                    <span class="check-box"></span>
                    <label>Buku Kuning (Suntik Meningitis)</label>
                </div>
                 <div class="check-item">
                    <span class="check-box"></span>
                    <label>Pas Foto 4x6 Latar Putih (6 Lembar)</label>
                </div>
            </div>

            <div class="footer">
                <div class="form-group">
                    <label>Petugas Penerima,</label>
                    <div class="signature-box">(Tanda Tangan & Nama Jelas)</div>
                </div>
                <div class="form-group">
                    <label>Jemaah Pendaftar,</label>
                     <div class="signature-box">(Tanda Tangan & Nama Jelas)</div>
                </div>
            </div>
        </form>
    </div>

</body>
</html>
<?php
}