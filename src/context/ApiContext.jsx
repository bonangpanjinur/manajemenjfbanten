import React, { createContext, useContext, useState, useCallback } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Base URL & Nonce dari localize script WP
    const { apiUrl, nonce } = window.umhData || { apiUrl: '', nonce: '' };

    const apiCall = useCallback(async (endpoint, method = 'GET', body = null) => {
        setLoading(true);
        setError(null);
        try {
            const headers = {
                'Content-Type': 'application/json',
                'X-WP-Nonce': nonce,
            };

            const config = {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
            };

            // Handle Query Params untuk GET
            let url = `${apiUrl}${endpoint}`;
            if (method === 'GET' && body) {
                const params = new URLSearchParams(body).toString();
                url += `?${params}`;
                delete config.body;
            }

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan pada server');
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiUrl, nonce]);

    // --- MASTER DATA (Hotel, Maskapai) ---
    const getMasterData = (type) => apiCall('master-data', 'GET', { type });
    const createMasterData = (data) => apiCall('master-data', 'POST', data);
    const updateMasterData = (id, data) => apiCall(`master-data/${id}`, 'PUT', data);
    const deleteMasterData = (id) => apiCall(`master-data/${id}`, 'DELETE');

    // --- KATEGORI ---
    const getCategories = () => apiCall('categories', 'GET');
    const createCategory = (data) => apiCall('categories', 'POST', data);
    const deleteCategory = (id) => apiCall(`categories/${id}`, 'DELETE');

    // --- PAKET ---
    const getPackages = (filters) => apiCall('packages', 'GET', filters);
    const getPackageDetail = (id) => apiCall(`packages/${id}`, 'GET');
    const createPackage = (data) => apiCall('packages', 'POST', data);
    const updatePackage = (id, data) => apiCall(`packages/${id}`, 'PUT', data);
    const deletePackage = (id) => apiCall(`packages/${id}`, 'DELETE');

    // --- JAMAAH (Persiapan) ---
    const getJamaahList = (filters) => apiCall('jamaah', 'GET', filters);
    const createJamaah = (data) => apiCall('jamaah', 'POST', data);

    const value = {
        loading,
        error,
        getMasterData,
        createMasterData,
        updateMasterData,
        deleteMasterData,
        getCategories,
        createCategory,
        deleteCategory,
        getPackages,
        getPackageDetail,
        createPackage,
        updatePackage,
        deletePackage,
        getJamaahList,
        createJamaah
    };

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};