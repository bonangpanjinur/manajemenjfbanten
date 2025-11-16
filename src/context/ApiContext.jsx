import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const ApiContext = createContext(null);

/**
 * ApiProvider
 * Hanya bertanggung jawab untuk mengambil dan mengelola data aplikasi.
 * Berjalan *setelah* AuthProvider memverifikasi pengguna.
 */
export const ApiProvider = ({ children }) => {
    const { apiConfig } = useAuth(); // Bergantung pada Auth
    const [data, setData] = useState({
        packages: [],
        jamaah: [],
        users: [],
        finance: [],
        tasks: [],
        hotels: [],
        flights: [],
        leads: [],
        financeAccounts: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jamaahPayments, setJamaahPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

    const getAuthHeaders = useCallback(() => {
        const headers = { 'Content-Type': 'application/json' };
        if (apiConfig && apiConfig.isWpAdmin) {
            headers['X-WP-Nonce'] = apiConfig.nonce;
        }
        return headers;
    }, [apiConfig]);

    const apiRequest = useCallback(async (endpoint, method = 'GET', body = null) => {
        if (!apiConfig) throw new Error("API config not ready.");
        
        const url = `${apiConfig.url}${endpoint}`;
        const options = {
            method,
            headers: getAuthHeaders(),
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Error ${response.status}`);
            }
            if (response.status === 204) return null;
            return await response.json();
        } catch (err) {
            console.error(`API Error (${method} ${endpoint}):`, err);
            setError(err.message);
            throw err;
        }
    }, [apiConfig, getAuthHeaders]);

    const fetchData = useCallback(async () => {
        if (!apiConfig) return;
        setLoading(true);
        setError(null);
        try {
            const endpoints = [
                'packages', 'jamaah', 'users', 'finance', 'tasks',
                'hotels', 'flights', 'marketing/leads', 'finance/accounts'
            ];
            const results = await Promise.all(
                endpoints.map(ep => apiRequest(ep).catch(e => {
                    console.warn(`Failed to fetch ${ep}:`, e.message);
                    return [];
                }))
            );
            
            setData({
                packages: results[0],
                jamaah: results[1],
                users: results[2],
                finance: results[3],
                tasks: results[4],
                hotels: results[5],
                flights: results[6],
                leads: results[7],
                financeAccounts: results[8],
            });
        } catch (err) {
            setError("Gagal memuat data utama.");
        } finally {
            setLoading(false);
        }
    }, [apiConfig, apiRequest]);

    // Ambil data saat provider dimuat
    useEffect(() => {
        if (apiConfig) { // Hanya fetch jika config sudah siap
            fetchData();
        }
    }, [apiConfig, fetchData]);

    // --- Fungsi CRUD ---

    const createItem = useCallback(async (endpoint, item, stateKey) => {
        const newItem = await apiRequest(endpoint, 'POST', item);
        setData(prev => ({
            ...prev,
            [stateKey]: [...prev[stateKey], newItem],
        }));
        return newItem;
    }, [apiRequest]);

    const updateItem = useCallback(async (endpoint, id, item, stateKey) => {
        const updatedItem = await apiRequest(`${endpoint}/${id}`, 'PUT', item);
        setData(prev => ({
            ...prev,
            [stateKey]: prev[stateKey].map(i => (i.id === updatedItem.id ? updatedItem : i)),
        }));
        return updatedItem;
    }, [apiRequest]);

    const deleteItem = useCallback(async (endpoint, id, stateKey) => {
        await apiRequest(`${endpoint}/${id}`, 'DELETE');
        setData(prev => ({
            ...prev,
            [stateKey]: prev[stateKey].filter(i => i.id !== id),
        }));
    }, [apiRequest]);

    const savePackage = (pkg) => {
        return pkg.id
            ? updateItem('packages', pkg.id, pkg, 'packages')
            : createItem('packages', pkg, 'packages');
    };
    const deletePackage = (id) => deleteItem('packages', id, 'packages');

    const saveJamaah = (jamaah) => {
        return jamaah.id
            ? updateItem('jamaah', jamaah.id, jamaah, 'jamaah')
            : createItem('jamaah', jamaah, 'jamaah');
    };
    const deleteJamaah = (id) => deleteItem('jamaah', id, 'jamaah');

    const saveFinance = (trx) => {
        return trx.id
            ? updateItem('finance', trx.id, trx, 'finance')
            : createItem('finance', trx, 'finance');
    };
    const deleteFinance = (id) => deleteItem('finance', id, 'finance');
    
    const saveFinanceAccount = (acc) => {
         return acc.id
            ? updateItem('finance/accounts', acc.id, acc, 'financeAccounts')
            : createItem('finance/accounts', acc, 'financeAccounts');
    };
    const deleteFinanceAccount = (id) => deleteItem('finance/accounts', id, 'financeAccounts');

    // --- Fungsi Pembayaran Jemaah ---
    const fetchJamaahPayments = useCallback(async (jamaahId) => {
        if (!jamaahId) {
            setJamaahPayments([]);
            return;
        }
        setLoadingPayments(true);
        try {
            const payments = await apiRequest(`jamaah/${jamaahId}/payments`);
            setJamaahPayments(payments);
        } catch (err) {
            setError("Gagal memuat riwayat pembayaran.");
        } finally {
            setLoadingPayments(false);
        }
    }, [apiRequest]);

    const saveJamaahPayment = useCallback(async (jamaahId, payment) => {
        let savedPayment;
        if (payment.id) {
            savedPayment = await apiRequest(`jamaah/payments/${payment.id}`, 'PUT', payment);
        } else {
            savedPayment = await apiRequest(`jamaah/${jamaahId}/payments`, 'POST', payment);
        }
        
        await fetchJamaahPayments(jamaahId);
        // Refresh data jemaah (penting untuk update saldo)
        const updatedJamaah = await apiRequest(`jamaah/${jamaahId}`);
        setData(prev => ({
            ...prev,
            jamaah: prev.jamaah.map(j => (j.id == jamaahId ? updatedJamaah : j)),
        }));
        
        return savedPayment;
    }, [apiRequest, fetchJamaahPayments]);

    const deleteJamaahPayment = useCallback(async (jamaahId, paymentId) => {
        await apiRequest(`jamaah/payments/${paymentId}`, 'DELETE');
        await fetchJamaahPayments(jamaahId);
        // Refresh data jemaah (penting untuk update saldo)
        const updatedJamaah = await apiRequest(`jamaah/${jamaahId}`);
        setData(prev => ({
            ...prev,
            jamaah: prev.jamaah.map(j => (j.id == jamaahId ? updatedJamaah : j)),
        }));
    }, [apiRequest, fetchJamaahPayments]);
    
    // Nilai yang disediakan oleh ApiProvider
    const value = useMemo(() => ({
        ...data,
        loading,
        error,
        fetchData,
        savePackage, deletePackage,
        saveJamaah, deleteJamaah,
        saveFinance, deleteFinance,
        saveFinanceAccount, deleteFinanceAccount,
        jamaahPayments, loadingPayments,
        fetchJamaahPayments,
        saveJamaahPayment,
        deleteJamaahPayment,
    }), [data, loading, error, fetchData, 
        savePackage, deletePackage, saveJamaah, deleteJamaah, saveFinance, deleteFinance,
        saveFinanceAccount, deleteFinanceAccount, jamaahPayments, loadingPayments,
        fetchJamaahPayments, saveJamaahPayment, deleteJamaahPayment
    ]);

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => useContext(ApiContext);