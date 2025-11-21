import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // PERBAIKAN: Nama variabel harus sesuai dengan dashboard-react.php (umh_wp_data)
    const globalSettings = window.umh_wp_data || {};

    const [currentUser, setCurrentUser] = useState(globalSettings.user || null);
    const [nonce, setNonce] = useState(globalSettings.nonce || '');
    const [token, setToken] = useState(localStorage.getItem('umh_token') || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!globalSettings.nonce) {
            console.warn("⚠️ UMH: Nonce tidak ditemukan. Pastikan plugin aktif.");
        } else {
            console.log("✅ UMH: Terhubung sebagai", globalSettings.user?.name);
        }
    }, []);

    const login = (userData, authToken) => {
        setCurrentUser(userData);
        setToken(authToken);
        localStorage.setItem('umh_token', authToken);
    };

    const logout = () => {
        setCurrentUser(null);
        setToken('');
        localStorage.removeItem('umh_token');
    };

    return (
        <AuthContext.Provider value={{ 
            currentUser, 
            nonce, // Penting untuk API WordPress
            token, 
            login, 
            logout,
            loading,
            // Helper data dari WP
            isAdmin: globalSettings.is_wp_admin,
            urls: {
                admin: globalSettings.adminUrl,
                print: globalSettings.printUrl
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
};