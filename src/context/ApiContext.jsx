import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext'; // .jsx dihapus

const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
    const { apiConfig } = useAuth();
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
        logs: [], // Ditambahkan
    });
    const [stats, setStats] = useState({ totals: {}, packages: [], financeChart: [] }); // Ditambahkan
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State terpisah
    const [jamaahPayments, setJamaahPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);

    const getAuthHeaders = useCallback(() => {
        const headers = { 'Content-Type': 'application/json' };
        if (apiConfig && apiConfig.isWpAdmin) {
            headers['X-WP-Nonce'] = apiConfig.nonce;
        }
        // TODO: Tambahkan logic Bearer Token di sini jika BUKAN wp_admin
        // if (apiConfig && !apiConfig.isWpAdmin && apiConfig.token) {
        //     headers['Authorization'] = `Bearer ${apiConfig.token}`;
        // }
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
                let errData;
                try {
                    errData = await response.json();
                } catch(e) {
                    errData = { message: `Error ${response.status}: ${response.statusText}` };
                }
                throw new Error(errData.message || `Error ${response.status}`);
            }
            if (response.status === 204 || response.headers.get("content-length") === "0") return null;
            return await response.json();
        } catch (err) {
            console.error(`API Error (${method} ${endpoint}):`, err);
            setError(err.message);
            throw err;
        }
    }, [apiConfig, getAuthHeaders]);

    // --- Fungsi Fetch Data ---

    const fetchData = useCallback(async (endpoint, stateKey) => {
        try {
            const result = await apiRequest(endpoint);
            setData(prev => ({ ...prev, [stateKey]: Array.isArray(result) ? result : [] }));
            return result;
        } catch (err) {
            console.warn(`Gagal memuat ${endpoint}:`, err.message);
            setError(`Gagal memuat ${endpoint}.`);
            setData(prev => ({ ...prev, [stateKey]: [] }));
        }
    }, [apiRequest]);
    
    const fetchAllData = useCallback(async () => {
        if (!apiConfig) return;
        setLoading(true);
        setError(null);
        
        const endpoints = [
            { ep: 'packages', key: 'packages' },
            { ep: 'jamaah', key: 'jamaah' },
            { ep: 'users', key: 'users' },
            { ep: 'finance', key: 'finance' },
            { ep: 'tasks', key: 'tasks' },
            { ep: 'hotels', key: 'hotels' },
            { ep: 'flights', key: 'flights' },
            { ep: 'marketing/leads', key: 'leads' },
            { ep: 'finance/accounts', key: 'financeAccounts' },
        ];
        
        try {
            await Promise.all(endpoints.map(e => fetchData(e.ep, e.key)));
        } catch (err) {
            // Error sudah ditangani di dalam fetchData
        } finally {
            setLoading(false);
        }
    }, [apiConfig, fetchData]);

    // Fetch data statistik (untuk Dashboard)
    const fetchStats = useCallback(async () => {
        if (!apiConfig) return;
        setLoadingStats(true);
        try {
            const [totals, packages, financeChart] = await Promise.all([
                apiRequest('stats/totals').catch(() => ({})),
                apiRequest('stats/packages').catch(() => []),
                apiRequest('stats/finance-chart').catch(() => []),
            ]);
            setStats({ totals, packages, financeChart });
        } catch (err) {
            console.error("Gagal memuat statistik:", err);
            setError("Gagal memuat statistik dashboard.");
        } finally {
            setLoadingStats(false);
        }
    }, [apiConfig, apiRequest]);

    // Fetch data log (untuk Logs)
    const fetchLogs = useCallback(async () => {
        if (!apiConfig) return;
        setLoadingLogs(true);
        try {
            await fetchData('logs', 'logs');
        } catch (err) {
            // error ditangani fetchData
        } finally {
            setLoadingLogs(false);
        }
    }, [apiConfig, fetchData]);

    // Ambil data utama saat provider dimuat
    useEffect(() => {
        if (apiConfig) {
            fetchAllData();
            fetchStats(); // Juga ambil stats
        }
    }, [apiConfig, fetchAllData, fetchStats]);

    // --- Fungsi CRUD Generik ---

    const createItem = useCallback(async (endpoint, item, stateKey) => {
        const newItem = await apiRequest(endpoint, 'POST', item);
        // API harus mengembalikan item yang baru dibuat
        if(newItem && newItem.id) {
            setData(prev => ({
                ...prev,
                [stateKey]: [...prev[stateKey], newItem],
            }));
        } else {
            // Jika API tidak mengembalikan item (cth: hanya ID), fetch ulang
            await fetchData(endpoint, stateKey);
        }
        return newItem;
    }, [apiRequest, fetchData]);

    const updateItem = useCallback(async (endpoint, id, item, stateKey) => {
        const updatedItem = await apiRequest(`${endpoint}/${id}`, 'PUT', item);
        // API harus mengembalikan item yang sudah diupdate
        if(updatedItem && updatedItem.id) {
            setData(prev => ({
                ...prev,
                [stateKey]: prev[stateKey].map(i => (i.id === updatedItem.id ? updatedItem : i)),
            }));
        } else {
            // Jika API tidak mengembalikan item, fetch ulang
           await fetchData(endpoint, stateKey);
        }
        return updatedItem;
    }, [apiRequest, fetchData]);

    const deleteItem = useCallback(async (endpoint, id, stateKey) => {
        await apiRequest(`${endpoint}/${id}`, 'DELETE');
        setData(prev => ({
            ...prev,
            [stateKey]: prev[stateKey].filter(i => i.id !== id),
        }));
    }, [apiRequest]);

    // --- CRUD Spesifik ---
    const savePackage = (pkg) => pkg.id ? updateItem('packages', pkg.id, pkg, 'packages') : createItem('packages', pkg, 'packages');
    const deletePackage = (id) => deleteItem('packages', id, 'packages');

    const saveJamaah = (jamaah) => jamaah.id ? updateItem('jamaah', jamaah.id, jamaah, 'jamaah') : createItem('jamaah', jamaah, 'jamaah');
    const deleteJamaah = (id) => deleteItem('jamaah', id, 'jamaah');

    const saveFinance = (trx) => trx.id ? updateItem('finance', trx.id, trx, 'finance') : createItem('finance', trx, 'finance');
    const deleteFinance = (id) => deleteItem('finance', id, 'finance');
    
    const saveFinanceAccount = (acc) => acc.id ? updateItem('finance/accounts', acc.id, acc, 'financeAccounts') : createItem('finance/accounts', acc, 'financeAccounts');
    const deleteFinanceAccount = (id) => deleteItem('finance/accounts', id, 'financeAccounts');

    // (BARU) CRUD Karyawan
    const saveUser = (user) => user.id ? updateItem('users', user.id, user, 'users') : createItem('users', user, 'users');
    const deleteUser = (id) => deleteItem('users', id, 'users');

    // (BARU) CRUD Leads
    const saveLead = (lead) => lead.id ? updateItem('marketing/leads', lead.id, lead, 'leads') : createItem('marketing/leads', lead, 'leads');
    const deleteLead = (id) => deleteItem('marketing/leads', id, 'leads');


    // --- Fungsi Pembayaran Jemaah ---
    const fetchJamaahPayments = useCallback(async (jamaahId) => {
        if (!jamaahId) {
            setJamaahPayments([]);
            return;
        }
        setLoadingPayments(true);
        try {
            const payments = await apiRequest(`jamaah/${jamaahId}/payments`);
            setJamaahPayments(Array.isArray(payments) ? payments : []);
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
    }, [apiRequest, fetchJamaahPayments]); // Hapus 'setData' dari dependensi

    const deleteJamaahPayment = useCallback(async (jamaahId, paymentId) => {
        await apiRequest(`jamaah/payments/${paymentId}`, 'DELETE');
        await fetchJamaahPayments(jamaahId);
        // Refresh data jemaah (penting untuk update saldo)
        const updatedJamaah = await apiRequest(`jamaah/${jamaahId}`);
        setData(prev => ({
            ...prev,
            jamaah: prev.jamaah.map(j => (j.id == jamaahId ? updatedJamaah : j)),
        }));
    }, [apiRequest, fetchJamaahPayments]); // Hapus 'setData' dari dependensi
    
    // Nilai yang disediakan oleh ApiProvider
    const value = useMemo(() => ({
        ...data,
        stats,
        loading,
        loadingStats,
        loadingLogs,
        error,
        fetchData: fetchAllData,
        fetchStats,
        fetchLogs,
        savePackage, deletePackage,
        saveJamaah, deleteJamaah,
        saveFinance, deleteFinance,
        saveFinanceAccount, deleteFinanceAccount,
        saveUser, deleteUser,
        saveLead, deleteLead,
        jamaahPayments, loadingPayments,
        fetchJamaahPayments,
        saveJamaahPayment,
        deleteJamaahPayment,
    }), [
        data, stats, loading, loadingStats, loadingLogs, error, fetchAllData, fetchStats, fetchLogs,
        savePackage, deletePackage, saveJamaah, deleteJamaah, saveFinance, deleteFinance,
        saveFinanceAccount, deleteFinanceAccount, saveUser, deleteUser, saveLead, deleteLead,
        jamaahPayments, loadingPayments,
        fetchJamaahPayments, saveJamaahPayment, deleteJamaahPayment
    ]);

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => useContext(ApiContext);