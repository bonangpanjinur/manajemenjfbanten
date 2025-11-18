import React, { createContext, useContext, useState } from 'react';

// --- PERBAIKAN: Membaca data dari 'window.umh_wp_data' ---
const globalSettings = window.umh_wp_data || {};

// PERBAIKAN: Menyesuaikan nama variabel agar cocok dengan yang dikirim PHP
// 'current_user' diubah menjadi 'user'
// 'api_nonce' diubah menjadi 'nonce'
const initialUser = globalSettings.user || null;
const initialNonce = globalSettings.nonce || null; 
const initialApiUrl = globalSettings.api_url || '/wp-json/umh/v1';
// --- AKHIR PERBAIKAN ---

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(initialUser);
    
    // Sediakan juga data global lainnya agar mudah diakses
    const value = {
        currentUser,
        setCurrentUser, // Anda bisa gunakan ini jika ada halaman update profile
        nonce: initialNonce,
        apiUrl: initialApiUrl,
        adminUrl: globalSettings.adminUrl,
        printUrl: globalSettings.printUrl,
        isWpAdmin: globalSettings.is_wp_admin || false,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};