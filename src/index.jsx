import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Pastikan ID ini 'umroh-manager-hybrid-root' sesuai dengan file PHP dashboard-react.php
const container = document.getElementById('umroh-manager-hybrid-root');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Target container #umroh-manager-hybrid-root not found!');
}