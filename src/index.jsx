import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Fix untuk error: "Target element #umh-admin-app not found"
 * * Kita membungkus render React ke dalam event listener 'DOMContentLoaded'.
 * Ini memastikan bahwa kode React baru akan jalan SETELAH elemen HTML 
 * <div id="umh-admin-app"> selesai dibuat oleh browser.
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('umh-admin-app');

    // Pengecekan keamanan: Hanya render jika container ditemukan
    if (container) {
        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } else {
        // Optional: Log jika container tidak ketemu (misal script ter-load di halaman yang salah)
        // console.warn("UMH Plugin: Container #umh-admin-app tidak ditemukan, React abort.");
    }
});