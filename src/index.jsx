// Lokasi: src/index.jsx

import React from 'react';
// --- PERBAIKAN: Gunakan createRoot dari 'react-dom/client' untuk React 18 ---
import { createRoot } from 'react-dom/client';
// --- AKHIR PERBAIKAN ---
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ApiProvider } from './context/ApiContext.jsx';

// Hapus import style.js
// import { GlobalStyle } from './style';


// Render aplikasi React ke dalam elemen #umh-admin-app
const appElement = document.getElementById('umh-admin-app');
if (appElement) {
    // --- PERBAIKAN: Gunakan createRoot (React 18) ---
    const root = createRoot(appElement);
    root.render(
        <React.StrictMode>
            <AuthProvider>
                <ApiProvider>
                    {/* <GlobalStyle /> */}
                    <App />
                </ApiProvider>
            </AuthProvider>
        </React.StrictMode>
    );
    // --- AKHIR PERBAIKAN ---
} else {
    console.error('Target element #umh-admin-app not found.');
}