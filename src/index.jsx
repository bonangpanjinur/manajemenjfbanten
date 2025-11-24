// SANGAT PENTING: Konfigurasi Public Path untuk Lazy Loading di WordPress
// Ini harus dijalankan paling awal sebelum import komponen lain agar Webpack tahu lokasi chunk file
if (window.umrohManagerSettings && window.umrohManagerSettings.pluginUrl) {
    // eslint-disable-next-line no-undef, camelcase
    __webpack_public_path__ = window.umrohManagerSettings.pluginUrl + 'build/';
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Menemukan elemen root di HTML yang dibuat oleh file PHP
const container = document.getElementById('umroh-manager-app');

if (container) {
    const root = createRoot(container);
    // Render aplikasi utama
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}