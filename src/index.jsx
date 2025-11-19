// File Location: ./src/index.jsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx'; 
import { AuthProvider } from './context/AuthContext.jsx'; 
import { ApiProvider } from './context/ApiContext.jsx'; 

// --- PENTING: Import file CSS agar diproses oleh Webpack & Tailwind ---
import './index.css'; 
// ---------------------------------------------------------------------

// Render aplikasi React ke dalam elemen #umh-admin-app
const appElement = document.getElementById('umh-admin-app');
if (appElement) {
    const root = createRoot(appElement);
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
    console.error('Target element #umh-admin-app not found.');
}