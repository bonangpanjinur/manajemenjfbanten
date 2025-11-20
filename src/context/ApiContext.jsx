// File: src/context/ApiContext.jsx

import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    // Sesuaikan URL ini dengan konfigurasi server lokal Anda
    // Jika di XAMPP/Localhost biasanya: 'http://localhost/folder-project/wp-json/umh/v1'
    // Namun jika relative path sudah di-setup di proxy, gunakan relative
    const API_URL = '/wp-json/umh/v1'; 

    const apiCall = async (endpoint, method = 'GET', body = null, isFileUpload = false) => {
        setLoading(true);
        try {
            const headers = {
                'Authorization': `Bearer ${token}`
            };
            
            if (!isFileUpload) {
                headers['Content-Type'] = 'application/json';
            }

            const config = { method, headers };
            if (body) {
                config.body = isFileUpload ? body : JSON.stringify(body);
            }

            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan server');
            return data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // --- API METHODS ---

    // Master Data
    const getMasterData = (type) => apiCall(`/master-data?type=${type}`);
    const createMasterData = (data) => apiCall('/master-data', 'POST', data);
    const deleteMasterData = (id) => apiCall(`/master-data/${id}`, 'DELETE');

    // Categories
    const getCategories = () => apiCall('/categories');
    const createCategory = (data) => apiCall('/categories', 'POST', data);
    const deleteCategory = (id) => apiCall(`/categories/${id}`, 'DELETE');

    // Packages
    const getPackages = (filters) => apiCall(`/packages?${new URLSearchParams(filters)}`);
    const createPackage = (data) => apiCall('/packages', 'POST', data);
    const updatePackage = (id, data) => apiCall(`/packages/${id}`, 'PUT', data);
    const deletePackage = (id) => apiCall(`/packages/${id}`, 'DELETE');

    // Jamaah
    const getJamaah = (filters) => apiCall(`/jamaah?${new URLSearchParams(filters)}`);
    const createJamaah = (data) => apiCall('/jamaah', 'POST', data);
    const updateJamaah = (id, data) => apiCall(`/jamaah/${id}`, 'PUT', data);
    const deleteJamaah = (id) => apiCall(`/jamaah/${id}`, 'DELETE');

    // Finance & Reports
    const getCashflow = (filters) => apiCall(`/finance/cashflow?${new URLSearchParams(filters)}`);
    const createCashflow = (data) => apiCall('/finance/cashflow', 'POST', data);
    const createPayment = (data) => apiCall('/finance/payment', 'POST', data);
    const getDashboardStats = () => apiCall('/stats');

    return (
        <ApiContext.Provider value={{
            loading, apiCall,
            getMasterData, createMasterData, deleteMasterData,
            getCategories, createCategory, deleteCategory,
            getPackages, createPackage, updatePackage, deletePackage,
            getJamaah, createJamaah, updateJamaah, deleteJamaah,
            getCashflow, createCashflow, createPayment,
            getDashboardStats
        }}>
            {children}
        </ApiContext.Provider>
    );
};