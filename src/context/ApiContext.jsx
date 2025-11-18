import React, { createContext, useState, useEffect, useContext } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { useAuth } from './AuthContext';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

const useApiData = () => {
    const { currentUser } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- PENAMBAHAN: 'sub_agents' ditambahkan ke daftar endpoint ---
    const endpoints = [
        'packages', 'jamaah', 'finance', 'categories', 'accounts', 
        'marketing', 'hr', 'users', 'roles', 'logs', 'tasks', 'sub_agents'
    ];
    // --- AKHIR PENAMBAHAN ---

    const fetchData = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const requests = endpoints.map(endpoint =>
                apiFetch({ path: `/umh/v1/${endpoint}` })
                    .then(response => ({ [endpoint]: response }))
                    .catch(err => {
                        console.warn(`Failed to fetch ${endpoint}:`, err.message);
                        return { [endpoint]: [] }; // Kembalikan array kosong jika gagal
                    })
            );

            const results = await Promise.all(requests);
            
            const combinedData = results.reduce((acc, current) => ({ ...acc, ...current }), {});
            
            // Relasi data
            if (combinedData.jamaah && combinedData.jamaah_payments) {
                 combinedData.jamaah.forEach(j => {
                    j.total_payments = combinedData.jamaah_payments
                        .filter(p => p.jamaah_id === j.id && p.status === 'completed')
                        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
                });
            }

            setData(combinedData);
            
        } catch (err) {
            console.error('API Fetch Error:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser]); // Hanya refetch saat user berubah

    const createOrUpdate = async (endpoint, itemData, id = null) => {
        const method = id ? 'PUT' : 'POST';
        const path = id ? `/umh/v1/${endpoint}/${id}` : `/umh/v1/${endpoint}`;

        try {
            const response = await apiFetch({ path, method, data: itemData });
            
            // Update state secara optimis
            setData(prevData => {
                const endpointData = prevData[endpoint] || [];
                let newData;
                if (id) {
                    // Update
                    newData = endpointData.map(item => (item.id === id ? response : item));
                } else {
                    // Create
                    newData = [...endpointData, response];
                }
                return { ...prevData, [endpoint]: newData };
            });
            // Refetch data lengkap untuk sinkronisasi relasi (opsional tapi lebih aman)
            fetchData();
            return response;
        } catch (err) {
            console.error(`Failed to ${method} ${endpoint}:`, err);
            setError(err); // Tampilkan error ke user
            throw err; // Lempar error agar form bisa menangani
        }
    };

    const deleteItem = async (endpoint, id) => {
        try {
            await apiFetch({ path: `/umh/v1/${endpoint}/${id}`, method: 'DELETE' });
            
            // Update state secara optimis
            setData(prevData => {
                const endpointData = prevData[endpoint] || [];
                const newData = endpointData.filter(item => item.id !== id);
                return { ...prevData, [endpoint]: newData };
            });
        } catch (err) {
            console.error(`Failed to DELETE ${endpoint}:`, err);
            setError(err);
            throw err;
        }
    };

    return { data, loading, error, createOrUpdate, deleteItem, refreshData: fetchData };
};

export const ApiProvider = ({ children }) => {
    const apiData = useApiData();

    return (
        <ApiContext.Provider value={apiData}>
            {children}
        </ApiContext.Provider>
    );
};