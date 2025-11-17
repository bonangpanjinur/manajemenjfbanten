import React, { createContext, useContext, useState } from 'react';

// PERBAIKAN: Langsung baca data pengguna dari objek global 'umhApiSettings' yang dikirim PHP
const globalSettings = window.umhApiSettings || {};
const initialUser = globalSettings.currentUser || null;
const initialNonce = globalSettings.nonce || null;
const initialApiUrl = globalSettings.apiUrl || '/wp-json/umh/v1';

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