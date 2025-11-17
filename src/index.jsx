// Lokasi: src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
// --- PERBAIKAN: Path import absolut dari src/ ---
import App from 'App';
import { AuthProvider } from 'context/AuthContext';
import { ApiProvider } from 'context/ApiContext';
// --- AKHIR PERBAIKAN ---

// Hapus import style.js
// import { GlobalStyle } from './style';


// Render aplikasi React ke dalam elemen #umh-admin-app
const appElement = document.getElementById('umh-admin-app');
if (appElement) {
    ReactDOM.render(
        <React.StrictMode>
            <AuthProvider>
                <ApiProvider>
                    {/* <GlobalStyle /> */}
                    <App />
                </ApiProvider>
            </AuthProvider>
        </React.StrictMode>,
        appElement
    );
} else {
    console.error('Target element #umh-admin-app not found.');
}