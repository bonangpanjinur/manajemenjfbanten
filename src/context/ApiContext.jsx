import React, { createContext, useState, useEffect, useContext } from 'react';
// PERBAIKAN: Menambahkan ekstensi .jsx
import { useAuth } from './AuthContext.jsx'; 

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

// --- PERBAIKAN (No Route Found): ---
// Daftar endpoint yang TIDAK menggunakan 's' di akhir
// Ini harus cocok dengan $item_name di file PHP
const nonPluralEndpoints = ['hr', 'marketing', 'finance', 'jamaah'];

// Fungsi helper untuk mendapatkan URL endpoint yang benar
const getEndpointUrl = (apiUrl, key, id = null) => {
    const baseKey = key.replace(/s$/, ''); // Hapus 's' jika ada
    let endpoint = key;

    // Jika key ada di daftar non-plural, gunakan key tersebut apa adanya
    if (nonPluralEndpoints.includes(baseKey)) {
        endpoint = baseKey;
    } else if (!key.endsWith('s')) {
        // Jika tidak ada di daftar dan tidak diakhiri 's', tambahkan 's'
        // (Contoh: 'package' -> 'packages', 'role' -> 'roles')
        endpoint = `${key}s`;
    }
    
    // 'stats/totals' adalah kasus khusus
    if (key === 'stats/totals') {
        endpoint = 'stats/totals';
    }

    // PERBAIKAN: Kasus khusus untuk 'finance_accounts'
    if (key === 'finance_accounts') {
        endpoint = 'finance_accounts';
    }
    // --- AKHIR PERBAIKAN ---

    return id ? `${apiUrl}/${endpoint}/${id}` : `${apiUrl}/${endpoint}`;
};
// --- AKHIR PERBAIKAN ---


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
        // PERBAIKAN: Tambahkan state untuk finance_accounts
        finance_accounts: [],
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
            // --- PERBAIKAN (No Route Found): Gunakan helper getEndpointUrl ---
            const url = getEndpointUrl(apiUrl, key);
            // --- AKHIR PERBAIKAN ---
            const response = await fetch(url, {
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
            // PERBAIKAN: 'categories' adalah endpoint yang benar, bukan 'categorys'
            // PERBAIKAN: Tambahkan 'finance_accounts'
            const keys = [
                'packages', 'jamaah', 'departures', 'categories', 'flights',
                'hotels', 'finance', 'hr', 'roles', 'marketing', 'logs', 'tasks', 'stats/totals',
                'finance_accounts'
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
                        'finance_accounts': 'manage_finance', // Asumsi staf finance bisa lihat
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
                // Tampilkan hanya error pertama agar tidak terlalu ramai
                throw new Error(errorMessages[0] || 'Gagal memuat sebagian data');
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
            
            // --- PERBAIKAN (No Route Found): Gunakan helper getEndpointUrl ---
            const url = getEndpointUrl(apiUrl, key, isUpdate ? itemData.id : null);
            // --- AKHIR PERBAIKAN ---

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
            // --- PERBAIKAN (No Route Found): Gunakan helper getEndpointUrl ---
            const url = getEndpointUrl(apiUrl, key, id);
            // --- AKHIR PERBAIKAN ---

            const response = await fetch(url, {
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
                flights: [], hotels: [], finance: [], finance_accounts: [], hr: [], roles: [],
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