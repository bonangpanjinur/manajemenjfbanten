import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { useAuth } from './AuthContext.jsx'; // Pastikan ekstensi file benar

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [data, setData] = useState({
        packages: [],
        jamaah: [],
        finance: [],
        marketing: [],
        hr: [], // Staff list
        users: [], // Synced with HR
        sub_agents: [],
        roles: [],
        logs: [],
        stats: {},
        accounts: [],
        categories: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Daftar endpoint yang akan diambil saat inisialisasi
    const endpoints = [
        'packages', 
        'jamaah', 
        'finance', 
        'categories', 
        'finance_accounts', // Backend endpoint
        'marketing', 
        'users', // Backend endpoint untuk staff/hr
        'roles', 
        'logs', 
        'sub_agents', 
        'stats'
    ];

    const fetchAllData = useCallback(async () => {
        // Pastikan user login sebelum fetch
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
                    // Mapping endpoint ke state key jika berbeda
                    if (res.endpoint === 'finance_accounts') {
                        newData['accounts'] = res.value;
                    } else if (res.endpoint === 'users') {
                        newData['users'] = res.value;
                        newData['hr'] = res.value; // Sync HR dengan Users
                    } else {
                        newData[res.endpoint] = res.value;
                    }
                } else {
                    console.warn(`Warning: Failed to fetch ${res.endpoint}`, res.reason);
                }
            });

            setData(newData);
        } catch (err) {
            console.error('Critical API Error:', err);
            setError(err.message || 'Gagal terhubung ke server.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]); // Dependencies

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // CRUD: Create or Update
    const createOrUpdate = async (endpoint, itemData, id = null) => {
        const method = id ? 'PUT' : 'POST';
        // Handle special path cases if any
        const path = id ? `/umh/v1/${endpoint}/${id}` : `/umh/v1/${endpoint}`;

        try {
            const response = await apiFetch({ path, method, data: itemData });
            
            // Update Local State (Optimistic UI)
            // Tentukan key state berdasarkan endpoint
            let stateKey = endpoint;
            if (endpoint === 'finance_accounts') stateKey = 'accounts';
            
            setData(prevData => {
                const currentList = prevData[stateKey] || [];
                let newList;
                
                // Jika update
                if (id) {
                    newList = currentList.map(item => 
                        (item.id === id || item.ID === id) ? response : item
                    );
                } else {
                    // Jika create (tambah ke atas)
                    newList = [response, ...currentList];
                }

                // Khusus Users, update juga HR
                if (stateKey === 'users') {
                    return { ...prevData, users: newList, hr: newList };
                }

                return { ...prevData, [stateKey]: newList };
            });
            
            return response;
        } catch (err) {
            console.error(`API Error (${method} ${endpoint}):`, err);
            throw new Error(err.message || 'Terjadi kesalahan saat menyimpan data.');
        }
    };

    // CRUD: Delete
    const deleteItem = async (endpoint, id) => {
        try {
            await apiFetch({ path: `/umh/v1/${endpoint}/${id}`, method: 'DELETE' });
            
            let stateKey = endpoint;
            if (endpoint === 'finance_accounts') stateKey = 'accounts';

            setData(prevData => {
                const currentList = prevData[stateKey] || [];
                const newList = currentList.filter(item => item.id !== id && item.ID !== id);
                
                if (stateKey === 'users') {
                    return { ...prevData, users: newList, hr: newList };
                }

                return { ...prevData, [stateKey]: newList };
            });
        } catch (err) {
            console.error(`API Error (DELETE ${endpoint}):`, err);
            throw new Error(err.message || 'Gagal menghapus data.');
        }
    };

    // Helper: Refresh Single Resource
    const refreshData = async (resourceName) => {
        try {
            // Mapping resource name ke endpoint path
            let path = resourceName;
            if (resourceName === 'accounts') path = 'finance_accounts';
            if (resourceName === 'hr') path = 'users';

            const res = await apiFetch({ path: `/umh/v1/${path}` });
            
            setData(prev => {
                const newState = { ...prev, [resourceName]: res };
                // Sync users/hr
                if (resourceName === 'users') newState.hr = res;
                if (resourceName === 'hr') newState.users = res;
                return newState;
            });
        } catch (err) {
            console.error(`Gagal refresh ${resourceName}`, err);
        }
    };

    const value = {
        data,
        loading,
        error,
        createOrUpdate,
        deleteItem,
        refreshData
    };

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};