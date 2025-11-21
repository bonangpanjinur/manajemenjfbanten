import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const { token, nonce } = useAuth(); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = '/wp-json/umh/v1'; 

    const apiCall = async (endpoint, method = 'GET', body = null, isFileUpload = false) => {
        setLoading(true);
        setError(null);
        try {
            const headers = {
                'X-WP-Nonce': nonce, 
                'Accept': 'application/json'
            };
            
            if (token) headers['Authorization'] = `Bearer ${token}`;
            if (!isFileUpload) headers['Content-Type'] = 'application/json';

            const config = { method, headers };
            if (body) config.body = isFileUpload ? body : JSON.stringify(body);

            const response = await fetch(`${API_URL}${endpoint}`, config);
            const text = await response.text();
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                // Jika response bukan JSON (biasanya error PHP / HTML)
                console.error("❌ Non-JSON Response:", text);
                const errorPreview = text.includes('<') ? 'Server Error (Cek Console Browser)' : text;
                throw new Error(`Terjadi kesalahan server: ${errorPreview}`);
            }

            if (!response.ok) {
                // Tampilkan pesan error dari backend jika ada
                throw new Error(data.message || data.code || 'Gagal memproses permintaan');
            }
            
            return data;

        } catch (err) {
            console.error("API Error:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- EXPOSE METHODS ---
    const api = {
        get: (url) => apiCall(url, 'GET'),
        post: (url, data) => apiCall(url, 'POST', data),
        put: (url, data) => apiCall(url, 'PUT', data),
        delete: (url) => apiCall(url, 'DELETE'),
    };

    // Helper Methods (Legacy support)
    const getPackages = (filters) => apiCall(`/packages?${new URLSearchParams(filters)}`);
    const deletePackage = (id) => apiCall(`/packages/${id}`, 'DELETE');
    const createJamaah = (data) => apiCall('/jamaah', 'POST', data);
    const updateJamaah = (id, data) => apiCall(`/jamaah/${id}`, 'PUT', data);
    const createPayment = (data) => apiCall('/finance/payments', 'POST', data);
    const createCashTransaction = (data) => apiCall('/finance/cash-flow', 'POST', data);
    const getJamaahList = (filters) => apiCall(`/jamaah?${new URLSearchParams(filters)}`);
    const createOrUpdate = (resource, data, id = null) => id ? apiCall(`/${resource}/${id}`, 'PUT', data) : apiCall(`/${resource}`, 'POST', data);
    const getDashboardStats = () => apiCall('/stats/dashboard');
    const fetchLogs = () => apiCall('/logs');

    return (
        <ApiContext.Provider value={{
            loading,
            error,
            apiCall,
            api, 
            getPackages, deletePackage,
            createJamaah, updateJamaah, getJamaahList,
            createPayment, createCashTransaction, createOrUpdate,
            getDashboardStats, fetchLogs
        }}>
            {children}
        </ApiContext.Provider>
    );
};