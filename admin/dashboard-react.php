<?php
// File: admin/dashboard-react.php
// Ini adalah file "host" untuk aplikasi React Anda.

// ... existing code ...
function umroh_manager_render_dashboard_react() {

    // Script dan style sudah di-enqueue dengan benar di class utama.
    // Kita hanya perlu menyediakan div target untuk React.

    ?>
    <div class="wrap">
        <!-- 
          PERBAIKAN: ID diubah menjadi 'umh-admin-app' 
          agar sesuai dengan yang dicari oleh build/index.js 
          (dari src/index.jsx)
        -->
        <div id="umh-admin-app">
            <!-- React akan menggantikan konten ini -->
            <p style="padding: 20px; text-align: center;">Memuat aplikasi manajemen...</p>
        </div>
    </div>
    <?php
}