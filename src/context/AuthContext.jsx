import React, { createContext, useContext, useState } from 'react';

// PERBAIKAN: Membaca data dari 'umh_wp_data' agar sesuai dengan PHP
const globalSettings = window.umh_wp_data || {};
const initialUser = globalSettings.current_user || null; // DIUBAH: dari currentUser
const initialNonce = globalSettings.api_nonce || null; // DIUBAH: dari nonce
const initialApiUrl = globalSettings.api_url || '/wp-json/umh/v1'; // DIUBAH: dari apiUrl

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
        // PERBAIKAN: Tambahkan isWpAdmin (dibaca dari PHP)
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