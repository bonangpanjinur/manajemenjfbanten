import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Pastikan DOM sudah siap
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('umroh-manager-hybrid-root');
    
    if (container) {
        // Hapus loading text manual dari PHP jika ada
        container.innerHTML = ''; 
        
        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } else {
        console.error('Target container #umroh-manager-hybrid-root tidak ditemukan.');
    }
});