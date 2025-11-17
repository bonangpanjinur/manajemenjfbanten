import React, { createContext, useState, useEffect, useContext } from 'react';
// PERBAIKAN: Menambahkan ekstensi .jsx
import { useAuth } from './AuthContext.jsx'; 

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    // PERBAIKAN: Ambil 'apiUrl', 'nonce', 'user' dari AuthContext
    const { nonce, currentUser, capabilities, apiUrl } = useAuth(); // DIUBAH ke currentUser
    const [data, setData] = useState({
        packages: [],
        jamaah: [],
        departures: [],
        categories: [],
        flights: [],
        hotels: [],
        finance: [],
        hr: [],
        roles: [],
        marketing: [],
        logs: [],
        tasks: [],
        stats: {},
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // PERBAIKAN: Hapus baris ini, karena 'apiUrl' sudah didapat dari 'useAuth()'
    // const apiUrl = window.umhApiSettings.apiUrl;

    const fetchData = async (key) => {
        try {
            // PERBAIKAN: 'apiUrl' sekarang berasal dari context
            const response = await fetch(`${apiUrl}/${key}`, {
                headers: {
                    'X-WP-Nonce': nonce,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch ${key}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            throw error; // Rethrow to be caught by refreshData
        }
    };

    const refreshData = async () => {
        setLoading(true);
        setError(null);
        try {
            // PERBAIKAN: 'stats/totals' adalah endpoint yang benar, bukan 'stats'
            const keys = [
                'packages', 'jamaah', 'departures', 'categories', 'flights',
                'hotels', 'finance', 'hr', 'roles', 'marketing', 'logs', 'tasks', 'stats/totals'
            ];
            
            const promises = keys.map(key => fetchData(key));
            const results = await Promise.allSettled(promises);

            const newData = { ...data }; // Start with old data
            let hasError = false;
            let errorMessages = [];

            results.forEach((result, index) => {
                let key = keys[index];
                if (key === 'stats/totals') {
                    key = 'stats'; // Simpan hasil 'stats/totals' ke dalam data.stats
                }

                if (result.status === 'fulfilled') {
                    newData[key] = result.value;
                } else {
                    // Handle specific errors, e.g., based on capabilities
                    const capMap = {
                        'finance': 'manage_finance',
                        'hr': 'manage_hr',
                        'marketing': 'manage_marketing',
                        'logs': 'manage_logs',
                    };
                    
                    // Only show error if user is supposed to see this data
                    if (!capMap[key] || (capabilities && capabilities[capMap[key]])) {
                        hasError = true;
                        errorMessages.push(result.reason.message || `Failed to load ${key}`);
                    }
                    // If failed, retain old data for that key instead of wiping it
                }
            });

            setData(newData);

            if (hasError) {
                throw new Error(errorMessages.join(', '));
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const createOrUpdate = async (key, itemData) => {
        // PERBAIKAN: Jangan setLoading(true) di sini, biarkan form yang atur
        // setLoading(true);
        setError(null);
        try {
            const isUpdate = itemData.id;
            // PERBAIKAN: 'apiUrl' sekarang berasal dari context
            const url = isUpdate ? `${apiUrl}/${key}s/${itemData.id}` : `${apiUrl}/${key}s`; // Tambahkan 's'
            const method = isUpdate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                },
                body: JSON.stringify(itemData),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Gagal ${isUpdate ? 'memperbarui' : 'membuat'} data`);
            }
            
            // Full refresh (seperti pola yang ada)
            await refreshData();
            return data;
        } catch (error) {
            console.error(`Error in createOrUpdate (${key}):`, error);
            setError(error.message);
            throw error; // Rethrow so the form can catch it
        } finally {
            // setLoading(false);
        }
    };

    const deleteItem = async (key, id) => {
        setLoading(true); // Set loading saat menghapus
        setError(null);
        try {
            // PERBAIKAN: 'apiUrl' sekarang berasal dari context dan tambahkan 's'
            const response = await fetch(`${apiUrl}/${key}s/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': nonce,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menghapus data');
            }

            // Full refresh
            await refreshData();
            return data;
        } catch (error) {
            console.error(`Error deleting item (${key}):`, error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentStatus = async (paymentId, newStatus) => {
        setLoading(true); // Set loading spesifik untuk aksi ini
        setError(null); // Membersihkan error sebelumnya
        try {
            // --- PERBAIKAN BUG (Kategori 4) ---
            // URL, Method, dan Body disesuaikan dengan endpoint PHP
            // Endpoint PHP: PUT /jamaah/payments/(?P<payment_id>\d+)
            // Callback: update_payment_status (mengambil 'status' dari json_params)

            // PERBAIKAN: 'apiUrl' sekarang berasal dari context
            const response = await fetch(`${apiUrl}/jamaah/payments/${paymentId}`, {
                method: 'PUT', // <-- DIUBAH (sebelumnya POST)
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                },
                body: JSON.stringify({ status: newStatus }), // <-- DIUBAH (hanya kirim status)
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal memperbarui status pembayaran.');
            }

            // Full refresh untuk mengambil data jamaah yang sudah di-recalculate
            await refreshData(); 
            
            return data;
        } catch (error) {
            console.error('Error updating payment status:', error);
            setError(error.message);
            throw error; // Dilempar lagi agar modal bisa menangkapnya
        } finally {
            setLoading(false); // <-- PERBAIKAN: Typo (sebelumnya False)
        }
    };

    // Initial data load on auth ready
    useEffect(() => {
        if (nonce && currentUser) { // DIUBAH ke currentUser
            refreshData();
        } else if (!currentUser) { // DIUBAH ke currentUser
            // Jika user logout, bersihkan data
            setData({
                packages: [], jamaah: [], departures: [], categories: [],
                flights: [], hotels: [], finance: [], hr: [], roles: [],
                marketing: [], logs: [], tasks: [], stats: {},
            });
            setLoading(false);
        }
    }, [nonce, currentUser]); // DIUBAH ke currentUser

    return (
        <ApiContext.Provider value={{
            data,
            loading,
            error,
            refreshData,
            createOrUpdate,
            deleteItem,
            updatePaymentStatus // expose fungsi baru
        }}>
            {children}
        </ApiContext.Provider>
    );
};