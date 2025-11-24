<?php
/**
 * Template for React Admin Dashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="wrap umh-wrapper">
    <!-- 
      React akan me-render aplikasi di dalam div ini.
      Teks 'Loading' di bawah ini berguna untuk debugging.
      Jika Anda melihat teks ini terus menerus, berarti React gagal mounting.
    -->
    <div id="umroh-manager-hybrid-root">
        <div style="padding: 20px; background: #fff; border: 1px solid #ccd0d4; margin-top: 20px; border-left: 4px solid #72aee6;">
            <h2>Sedang Memuat Aplikasi...</h2>
            <p>Jika halaman ini tidak berubah dalam beberapa detik, pastikan:</p>
            <ol>
                <li>Anda sudah menjalankan command <code>npm run build</code>.</li>
                <li>Tidak ada error di Browser Console (Tekan F12 -> Console).</li>
                <li>Plugin terinstall dengan benar.</li>
            </ol>
        </div>
    </div>
</div>