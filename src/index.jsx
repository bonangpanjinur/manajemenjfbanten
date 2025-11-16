import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // .jsx dihapus
import { AuthProvider } from './context/AuthContext'; // .jsx dihapus
import { ApiProvider } from './context/ApiContext'; // .jsx dihapus

// Hapus import style.js, karena kita akan menggunakan Tailwind
// import { GlobalStyle } from './style.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('umh-admin-app');
    
    if (rootEl) {
        // (Pastikan Anda me-load Tailwind CSS melalui file PHP utama)
        
        const root = createRoot(rootEl);
        root.render(
            <React.StrictMode>
                {/* <GlobalStyle /> Hapus ini */}
                <AuthProvider>
                    <ApiProvider>
                        <App />
                    </ApiProvider>
                </AuthProvider>
            </React.StrictMode>
        );
    } else {
        console.error('UMH Error: Target root element "umh-admin-app" not found in DOM.');
    }
});