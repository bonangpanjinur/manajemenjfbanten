// Lokasi: src/context/ApiContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// --- PERBAIKAN: Path import relatif dengan ekstensi .jsx ---
import { useAuth } from './AuthContext.jsx';
// --- AKHIR PERBAIKAN ---

const ApiContext = createContext();

// Hook kustom untuk mengakses API
export const useApi = () => useContext(ApiContext);

// API Provider
export const ApiProvider = ({ children }) => {
    // PERBAIKAN: Ambil data yang sudah benar dari AuthContext (tanpa 'token')
    const { currentUser, apiUrl, isWpAdmin, nonce: wpNonce } = useAuth(); 
    
    // --- PERBAIKAN: Menutup 'useState' dan mendefinisikan state lain ---
    const [data, setData] = useState({
        packages: [],
        jamaah: [],
        finance: [],
        hr: [],
        marketing: [],
        logs: [],
        stats: {},
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // --- AKHIR PERBAIKAN ---

    // --- PERBAIKAN: Hanya satu definisi 'getAuthHeaders' ---
    // Fungsi untuk mendapatkan headers autentikasi
    const getAuthHeaders = useCallback(() => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        if (isWpAdmin) {
            if (wpNonce) {
                headers.append('X-WP-Nonce', wpNonce);
            } else {
                console.warn('WP Nonce is not available, API calls might fail.');
            }
        } else {
            // Mode Headless (non-WP-Admin)
            // PERBAIKAN: Logika token dihapus karena tidak disediakan oleh AuthContext
            console.warn('Mode non-WP-Admin (headless) belum didukung otentikasinya.');
        }
        return headers;
    }, [isWpAdmin, wpNonce]); // PERBAIKAN: 'token' dihapus dari dependensi
    // --- AKHIR PERBAIKAN ---

    // --- PERBAIKAN: Hanya satu definisi 'fetchData' ---
    // Fungsi untuk fetch data dari API
    const fetchData = useCallback(async (key) => {
        const headers = getAuthHeaders();
        
        // PERBAIKAN: Pastikan apiUrl ada
        if (!apiUrl) {
            console.error("apiUrl not available from AuthContext.");
            setLoading(false);
            const configError = "API configuration is missing.";
            setError(configError);
            throw new Error(configError);
        }
        
        try {
            // endpoint 'marketing' tidak pakai 's', 'hr' juga
            const endpointKey = (key === 'marketing' || key === 'hr') ? key : `${key}s`;
            const response = await fetch(`${apiUrl}/${endpointKey}`, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch ${key}`);
            }
            return await response.json();
        } catch (err) {
            console.error(`Error fetching ${key}:`, err);
            setError(err.message);
            throw err; // Re-throw untuk ditangani oleh Promise.all
        }
    }, [getAuthHeaders, apiUrl]); // PERBAIKAN: Tambahkan apiUrl
    // --- AKHIR PERBAIKAN ---

    // Fungsi untuk refresh semua data
    const refreshData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [packages, jamaah, finance, hr, marketing, logs, stats] = await Promise.all([
                fetchData('package'),
                fetchData('jamaah'),
                fetchData('finance'),
                fetchData('hr'),
                fetchData('marketing'),
                fetchData('log'),
                fetchData('stats') // 'stats' adalah endpoint tunggal, tidak perlu 's'
            ]);
            setData({ packages, jamaah, finance, hr, marketing, logs, stats });
        } catch (err) {
            console.error('Failed to load initial data:', err);
            setError('Gagal memuat data. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    }, [fetchData]);

    // Load data saat komponen mount
    useEffect(() => {
        if (currentUser && apiUrl) { // Hanya fetch jika user dan apiUrl ada
            refreshData();
        } else if (!currentUser) {
            setLoading(false);
            // setError("User data not found. Cannot fetch API data."); // Bisa jadi terlalu agresif
            console.warn("User data not available, waiting...");
        } else if (!apiUrl) {
             setLoading(false);
             setError("API URL is not defined. Cannot fetch data.");
        }
    }, [currentUser, apiUrl, refreshData]);

    // Fungsi CRUD generik
    const createOrUpdate = async (key, itemData) => {
        const headers = getAuthHeaders();
        if (!apiUrl) {
            console.error("apiUrl not available from AuthContext.");
            throw new Error("API configuration is missing.");
        }
        const isUpdate = itemData.id;
        const endpointKey = (key === 'marketing' || key === 'hr') ? key : `${key}s`;
        const url = isUpdate ? `${apiUrl}/${endpointKey}/${itemData.id}` : `${apiUrl}/${endpointKey}`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(itemData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${method} ${key}`);
            }
            await refreshData(); // Refresh semua data
            return await response.json();
        } catch (err) {
            console.error(`Error ${method} ${key}:`, err);
            setError(err.message);
            throw err;
        }
    };

    // Fungsi delete generik
    const deleteItem = async (key, id) => {
        const headers = getAuthHeaders();
        if (!apiUrl) {
            console.error("apiUrl not available from AuthContext.");
            throw new Error("API configuration is missing.");
        }
        const endpointKey = (key === 'marketing' || key === 'hr') ? key : `${key}s`;
        const url = `${apiUrl}/${endpointKey}/${id}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete ${key}`);
            }
            await refreshData(); // Refresh semua data
            return await response.json();
        } catch (err) {
            console.error(`Error deleting ${key}:`, err);
            setError(err.message);
            throw err;
        }
    };

    // Fungsi khusus (contoh: update status pembayaran)
    const updatePaymentStatus = async (paymentId, status) => {
        const headers = getAuthHeaders();
        if (!apiUrl) {
            console.error("apiUrl not available from AuthContext.");
            throw new Error("API configuration is missing.");
        }
        const url = `${apiUrl}/jamaah-payments/update-status`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ payment_id: paymentId, status: status }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update payment status');
            }
            await refreshData(); // Refresh data
            return await response.json();
        } catch (err) {
            console.error('Error updating payment status:', err);
            setError(err.message);
            throw err;
        }
    };

    // Fungsi khusus upload file
    const uploadFile = async (formData) => {
        const headers = getAuthHeaders();
        if (!apiUrl) {
            console.error("apiUrl not available from AuthContext.");
            throw new Error("API configuration is missing.");
        }
        const url = `${apiUrl}/uploads`;

        // Hapus 'Content-Type' agar browser bisa set 'multipart/form-data' dengan boundary
        headers.delete('Content-Type'); 

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload file');
            }
            // Tidak perlu refreshData() di sini, biarkan pemanggil yang memutuskan
            return await response.json(); 
        } catch (err) {
            console.error('Error uploading file:', err);
            setError(err.message);
            throw err;
        }
    };


    const value = {
        data,
        loading,
        error,
        refreshData,
        createOrUpdate,
        deleteItem,
        updatePaymentStatus,
        uploadFile,
        // Anda bisa tambahkan fungsi spesifik lain di sini
    };

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};