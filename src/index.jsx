import React from 'react';
import { createRoot } from 'react-dom/client';
// PERBAIKAN: Menambahkan ekstensi .jsx
import { AuthProvider } from './context/AuthContext.jsx';
import { ApiProvider } from './context/ApiContext.jsx';
import App from './App.jsx'; // Import App.jsx yang sudah bersih

// --- Render Aplikasi ---
document.addEventListener('DOMContentLoaded', () => {
    // Target div dari admin/dashboard-react.php
    // PERBAIKAN: ID disamakan menjadi 'umh-admin-app'
    const rootEl = document.getElementById('umh-admin-app');
    
    if (rootEl) {
        // Muat Tailwind CSS
        if (!document.getElementById('tailwind-css')) {
            const tailwindScript = document.createElement('script');
            tailwindScript.id = 'tailwind-css';
            tailwindScript.src = 'https://cdn.tailwindcss.com';
            document.head.appendChild(tailwindScript);
        }
        
        const root = createRoot(rootEl);
        root.render(
            <React.StrictMode>
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