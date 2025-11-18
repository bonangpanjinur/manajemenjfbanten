import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { useAuth } from './AuthContext';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [data, setData] = useState({
        packages: [],
        jamaah: [],
        finance: [],
        marketing: [],
        hr: [],
        users: [],
        sub_agents: [],
        roles: [],
        logs: [],
        stats: {} // Tambahkan ini
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const endpoints = [
        'packages', 'jamaah', 'finance', 'categories', 'accounts', 
        'marketing', 'hr', 'users', 'roles', 'logs', 'tasks', 'sub_agents', 'stats' // Tambah stats
    ];

    // Fungsi untuk fetch semua data (Initial Load)
    // Menggunakan Promise.allSettled agar satu error tidak membatalkan semua
    const fetchAllData = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const promises = endpoints.map(endpoint => 
                apiFetch({ path: `/umh/v1/${endpoint}` })
                    .then(res => ({ status: 'fulfilled', endpoint, value: res }))
                    .catch(err => ({ status: 'rejected', endpoint, reason: err }))
            );

            const results = await Promise.all(promises);
            
            const newData = { ...data };
            
            results.forEach(res => {
                if (res.status === 'fulfilled') {
                    newData[res.endpoint] = res.value;
                } else {
                    console.warn(`Gagal memuat ${res.endpoint}:`, res.reason);
                    // Opsional: Set error state spesifik jika perlu
                }
            });

            // Kalkulasi Relasi Sederhana (Client Side Calculation)
            // Note: Sebaiknya ini dipindah ke backend jika data besar
            if (newData.jamaah && newData.jamaah_payments) {
                newData.jamaah = newData.jamaah.map(j => {
                    const payments = Array.isArray(newData.jamaah_payments) 
                        ? newData.jamaah_payments.filter(p => p.jamaah_id === j.id && p.status === 'paid')
                        : [];
                    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                    return { ...j, amount_paid: totalPaid }; // Update data lokal
                });
            }

            setData(newData);
            
        } catch (err) {
            console.error('Critical API Error:', err);
            setError(err.message || 'Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Fungsi Create/Update
    const createOrUpdate = async (endpoint, itemData, id = null) => {
        const method = id ? 'PUT' : 'POST';
        const path = id ? `/umh/v1/${endpoint}/${id}` : `/umh/v1/${endpoint}`;

        try {
            const response = await apiFetch({ path, method, data: itemData });
            
            // Optimistic UI Update
            setData(prevData => {
                const currentList = prevData[endpoint] || [];
                let newList;
                if (id) {
                    newList = currentList.map(item => (item.id === id ? response : item));
                } else {
                    newList = [response, ...currentList]; // Tambah ke atas
                }
                return { ...prevData, [endpoint]: newList };
            });

            // Opsional: Refresh data jika perlu relasi server-side yang kompleks
            // fetchAllData(); 
            
            return response;
        } catch (err) {
            console.error(`Failed to ${method} ${endpoint}:`, err);
            throw err;
        }
    };

    // Fungsi Delete
    const deleteItem = async (endpoint, id) => {
        try {
            await apiFetch({ path: `/umh/v1/${endpoint}/${id}`, method: 'DELETE' });
            
            setData(prevData => {
                const currentList = prevData[endpoint] || [];
                const newList = currentList.filter(item => item.id !== id && item.ID !== id); // Handle 'id' vs 'ID'
                return { ...prevData, [endpoint]: newList };
            });
        } catch (err) {
            console.error(`Failed to DELETE ${endpoint}:`, err);
            throw err;
        }
    };

    // Fungsi untuk fetch resource spesifik (untuk refresh parsial)
    const fetchResource = async (endpoint) => {
        try {
            const res = await apiFetch({ path: `/umh/v1/${endpoint}` });
            setData(prev => ({ ...prev, [endpoint]: res }));
        } catch (err) {
            console.error(`Gagal refresh ${endpoint}`, err);
        }
    };
    
    // Khusus pembayaran
    const updatePaymentStatus = async (paymentId, status) => {
        try {
             const res = await apiFetch({ 
                path: `/umh/v1/jamaah/payments/${paymentId}`,
                method: 'PUT',
                data: { status }
            });
            // Refresh jamaah dan payments untuk sinkronisasi saldo
            await Promise.all([
                fetchResource('jamaah'),
                fetchResource('jamaah_payments') // Asumsi endpoint ini ada di list utama
            ]);
            return res;
        } catch (err) {
            throw err;
        }
    };

    const value = {
        data,
        loading,
        error,
        createOrUpdate,
        deleteItem,
        refreshData: fetchAllData,
        fetchResource,
        updatePaymentStatus,
        fetchLogs: () => fetchResource('logs')
    };

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};