import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider
 * Hanya bertanggung jawab untuk mengelola status autentikasi pengguna.
 */
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [apiConfig, setApiConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Cek data dari WordPress
        if (typeof umh_wp_data !== 'undefined' && umh_wp_data.current_user) {
            setCurrentUser(umh_wp_data.current_user);
            setApiConfig({
                url: umh_wp_data.api_url,
                nonce: umh_wp_data.api_nonce,
                isWpAdmin: umh_wp_data.is_wp_admin,
            });
        } else {
            // TODO: Tambahkan logika login PWA/Headless di sini
            console.warn("UMH: Data pengguna tidak ditemukan. (umh_wp_data)");
            // Jika bukan di wp-admin, mungkin redirect ke halaman login
        }
        setIsLoading(false);
    }, []);

    const logout = () => {
        // Untuk WP-Admin, logout akan di-handle oleh link logout WP
        console.log("Logout triggered");
        // TODO: Cari link logout WP dan arahkan ke sana
        const logoutLink = document.querySelector('a[href*="logout"]');
        if (logoutLink) {
            window.location.href = logoutLink.href;
        } else {
            console.warn("Logout link not found.");
        }
    };

    const value = useMemo(() => ({
        currentUser,
        apiConfig,
        isLoading,
        logout,
    }), [currentUser, apiConfig, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);