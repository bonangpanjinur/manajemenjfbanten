// Lokasi: src/context/ApiContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// --- PERBAIKAN: Path import relatif dengan ekstensi .jsx ---
import { useAuth } from './AuthContext.jsx';
// --- AKHIR PERBAIKAN ---

const ApiContext = createContext();
// ... sisa kode ...
// ... (Kode yang ada sebelumnya tidak diubah) ...
export const useApi = () => useContext(ApiContext);

// API Provider
export const ApiProvider = ({ children }) => {
    const { currentUser, token, isWpAdmin, wpNonce } = useAuth();
    const [data, setData] = useState({
        'jamaah': [],
        'packages': [],
        'departures': [],
        'jamaah-payments': [],
        'jamaah-documents': [],
        'marketing': [],
        'hr': [],
        'finance': [],
        'categories': [],
        'logs': [],
        'flights': [],
        'hotels': [],
        'hotel-bookings': [],
        'flight-bookings': [],
        'tasks': [],
        'users': [],
        'stats': {},
        'roles': [], 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Kunci data yang ingin kita fetch
    const dataKeys = [
        'jamaah',
        'packages',
        'departures',
        'jamaah-payments',
        // 'jamaah-documents', // Mungkin terlalu banyak, fetch on demand?
        'marketing',
        'hr',
        'finance',
        'categories',
        'logs',
        'flights',
        'hotels',
        // 'hotel-bookings', // Fetch via package details
        // 'flight-bookings', // Fetch via package details
        'tasks',
        'users',
        'stats',
        'roles', 
    ];

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
            // TODO: Implement Headless mode auth (Bearer Token)
            if (token) {
                headers.append('Authorization', `Bearer ${token}`);
            } else {
                console.warn('JWT Token is not available, API calls might fail.');
            }
        }
        return headers;
    }, [isWpAdmin, wpNonce, token]);

    // Fungsi untuk fetch data dari API
    const fetchData = useCallback(async (key) => {
        const headers = getAuthHeaders();
        // Pastikan umhApiSettings tersedia
        if (!window.umhApiSettings || !window.umhApiSettings.apiUrl) {
            console.error("umhApiSettings not available on window object.");
            throw new Error("API configuration is missing.");
        }
        const apiUrl = window.umhApiSettings.apiUrl;

        try {
            // endpoint 'marketing' tidak pakai 's', 'hr' juga
            const endpoint = (key === 'marketing' || key === 'hr') ? key : `${key}s`;
            
            const response = await fetch(`${apiUrl}/${endpoint}`, {
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
    }, [getAuthHeaders]);

    // Fungsi untuk refresh semua data
    const refreshAllData = useCallback(async () => {
        if (!currentUser) {
            // Jika tidak ada user, jangan fetch, tapi set loading=false
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const promises = dataKeys.map(key => fetchData(key));
            const results = await Promise.all(promises);

            const newData = { ...data }; // Mulai dengan data lama
            dataKeys.forEach((key, index) => {
                newData[key] = results[index];
            });

            setData(newData);
        } catch (err) {
            console.error('Failed during data refresh:', err);
            setError('Gagal memuat beberapa data. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    }, [currentUser, fetchData, dataKeys, data]); // 'data' ditambahkan agar 'newData' selalu update

    // Fungsi untuk refresh satu jenis data
    const refreshData = useCallback(async (key) => {
        if (!dataKeys.includes(key)) {
            console.warn(`Attempted to refresh invalid data key: ${key}`);
            return;
        }
        try {
            const result = await fetchData(key);
            setData(prevData => ({
                ...prevData,
                [key]: result,
            }));
        } catch (err) {
            console.error(`Failed to refresh single key ${key}:`, err);
            setError(`Gagal me-refresh data ${key}.`);
        }
    }, [fetchData, dataKeys]);

    // Fetch data saat komponen dimuat atau user berubah
    useEffect(() => {
        if (currentUser) {
             refreshAllData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]); // Hanya bergantung pada currentUser

    // Fungsi CRUD generik
    const createOrUpdate = async (key, itemData) => {
        const headers = getAuthHeaders();
        if (!window.umhApiSettings || !window.umhApiSettings.apiUrl) {
            console.error("umhApiSettings not available on window object.");
            throw new Error("API configuration is missing.");
        }
        const apiUrl = window.umhApiSettings.apiUrl;
        const isUpdate = itemData.id;
        
        // endpoint 'marketing' tidak pakai 's', 'hr' juga
        const endpoint = (key === 'marketing' || key === 'hr') ? key : `${key}s`;
        const url = isUpdate ? `${apiUrl}/${endpoint}/${itemData.id}` : `${apiUrl}/${endpoint}`;
        const method = 'POST'; // WP REST API menggunakan POST untuk create dan update

        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                throw new Error(errorData.message || 'Gagal menyimpan data.');
            }
            
            const result = await response.json();

            // Refresh data yang relevan
            if (key === 'jamaah') {
                refreshData('jamaah');
                refreshData('stats');
            } else if (key === 'finance' || key === 'jamaah-payments') {
                refreshData('finance');
                refreshData('jamaah-payments');
                refreshData('stats');
            } else {
                 // Refresh data plural (e.g., 'packages')
                refreshData(key);
            }

            return result; // Mengembalikan data yang baru dibuat/diupdate
        } catch (err) {
            console.error(`Error saving ${key}:`, err);
            setError(err.message);
            throw err; // Re-throw agar form bisa menangani error
        }
    };

    // Fungsi delete generik
    const deleteItem = async (key, id) => {
        const headers = getAuthHeaders();
        if (!window.umhApiSettings || !window.umhApiSettings.apiUrl) {
            console.error("umhApiSettings not available on window object.");
            throw new Error("API configuration is missing.");
        }
        const apiUrl = window.umhApiSettings.apiUrl;
        // endpoint 'marketing' tidak pakai 's', 'hr' juga
        const endpoint = (key === 'marketing' || key === 'hr') ? key : `${key}s`;
        const url = `${apiUrl}/${endpoint}/${id}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus data.');
            }
            
            // Refresh data yang relevan
            if (key === 'jamaah') {
                refreshData('jamaah');
                refreshData('stats');
            } else if (key === 'finance' || key === 'jamaah-payments') {
                refreshData('finance');
                refreshData('jamaah-payments');
                refreshData('stats');
            } else {
                refreshData(key); // e.g., 'packages'
            }

            return true;
        } catch (err) {
            console.error(`Error deleting ${key}:`, err);
            setError(err.message);
            throw err; // Re-throw agar bisa ditangani
        }
    };

    // Fungsi khusus (contoh: update status pembayaran)
    const updatePaymentStatus = async (paymentId, status) => {
        const headers = getAuthHeaders();
        if (!window.umhApiSettings || !window.umhApiSettings.apiUrl) {
            console.error("umhApiSettings not available on window object.");
            throw new Error("API configuration is missing.");
        }
        const apiUrl = window.umhApiSettings.apiUrl;
        const url = `${apiUrl}/jamaah-payments/update-status`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ payment_id: paymentId, status: status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengupdate status.');
            }
            
            refreshData('jamaah-payments');
            refreshData('finance'); // Verifikasi memicu entri finance
            refreshData('stats');
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
        if (!window.umhApiSettings || !window.umhApiSettings.apiUrl) {
            console.error("umhApiSettings not available on window object.");
            throw new Error("API configuration is missing.");
        }
        const apiUrl = window.umhApiSettings.apiUrl;
        const url = `${apiUrl}/uploads`;

        // Hapus 'Content-Type' agar browser bisa set 'multipart/form-data' dengan boundary
        headers.delete('Content-Type');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData, // FormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengupload file.');
            }
            
            // Tidak perlu refresh data di sini, panggil saja dari form
            return await response.json();
        } catch (err) {
            console.error('Error uploading file:', err);
            setError(err.message);
            throw err;
        }
    };

    // Nilai yang disediakan oleh context
    const value = {
        data,
        loading,
        error,
        refreshAllData,
        refreshData,
        createOrUpdate,
        deleteItem,
        updatePaymentStatus,
        uploadFile,
    };

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};