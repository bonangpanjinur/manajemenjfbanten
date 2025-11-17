<?php
// File: admin/dashboard-react.php
// Ini adalah file "host" untuk aplikasi React Anda.
// Pastikan file ini HANYA berisi kode ini.

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Callback untuk me-render halaman utama plugin.
 * Fungsi ini HANYA boleh berisi div target untuk React.
 */
function umh_render_react_dashboard() {
    // Script dan style (React & Tailwind) sudah di-enqueue
    // oleh file 'umroh-manager-hybrid.php'.
    // Kita hanya perlu menyediakan div target untuk React.
    ?>
    <div class="wrap">
        <!-- 
          ID 'umh-admin-app' ini adalah target tempat React akan di-render.
          Ini harus cocok dengan 'getElementById' di 'src/index.jsx' Anda.
        -->
        <div id="umh-admin-app">
            <!-- React akan menggantikan konten ini -->
            <p style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                Memuat aplikasi manajemen...
            </p>
        </div>
    </div>
    <?php
}