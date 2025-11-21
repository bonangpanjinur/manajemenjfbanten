<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<!-- Wrapper WordPress Default -->
<div class="wrap" id="umh-wrap-fix">
    <!-- Judul disembunyikan lewat CSS agar tidak duplikat dengan React -->
    <h1 class="wp-heading-inline" style="display:none;">Manajemen Umroh</h1>
    
    <!-- React Mount Point -->
    <!-- ID ini harus SAMA PERSIS dengan document.getElementById di src/index.jsx -->
    <div id="umroh-manager-hybrid-root">
        <!-- Loading State Awal (Pure CSS/HTML) sebelum React load -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <span class="dashicons dashicons-update spin" style="font-size: 40px; width: 40px; height: 40px; color: #2271b1;"></span>
            <p style="margin-top: 20px; font-size: 16px; color: #50575e;">Memuat Aplikasi Manajemen Umroh...</p>
        </div>
    </div>
</div>