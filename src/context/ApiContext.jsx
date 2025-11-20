import React, { createContext, useContext, useState, useCallback } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mengambil Base URL & Nonce dari localize script WP
    // Pastikan di functions.php Anda sudah melokalisasi script dengan handle 'umh-app-js' dan nama obyek 'umh_wp_data'
    const { apiUrl, nonce } = window.umh_wp_data || { apiUrl: '', nonce: '' };

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
            console.error(`API Error [${endpoint}]:`, err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiUrl, nonce]);

    // --- API METHODS ---

    // 1. DASHBOARD
    const getDashboardStats = () => apiCall('/stats/dashboard', 'GET');

    // 2. MASTER DATA (Hotel, Maskapai, dll)
    const getMasterData = (type) => apiCall('/master-data', 'GET', { type });
    const createMasterData = (data) => apiCall('/master-data', 'POST', data);
    const updateMasterData = (id, data) => apiCall(`/master-data/${id}`, 'PUT', data);
    const deleteMasterData = (id) => apiCall(`/master-data/${id}`, 'DELETE');

    // 3. KATEGORI
    const getCategories = () => apiCall('/categories', 'GET');
    const createCategory = (data) => apiCall('/categories', 'POST', data);
    const deleteCategory = (id) => apiCall(`/categories/${id}`, 'DELETE');

    // 4. PAKET
    const getPackages = (filters) => apiCall('/packages', 'GET', filters);
    const getPackageDetail = (id) => apiCall(`/packages/${id}`, 'GET');
    const createPackage = (data) => apiCall('/packages', 'POST', data);
    const updatePackage = (id, data) => apiCall(`/packages/${id}`, 'PUT', data);
    const deletePackage = (id) => apiCall(`/packages/${id}`, 'DELETE');

    // 5. JAMAAH
    const getJamaahList = (filters) => apiCall('/jamaah', 'GET', filters);
    const createJamaah = (data) => apiCall('/jamaah', 'POST', data);
    const updateJamaah = (id, data) => apiCall(`/jamaah/${id}`, 'PUT', data);
    const deleteJamaah = (id) => apiCall(`/jamaah/${id}`, 'DELETE');

    // 6. KEUANGAN (FINANCE)
    const getFinanceStats = () => apiCall('/finance/stats', 'GET');
    const getCashFlow = (filters) => apiCall('/finance/cash-flow', 'GET', filters);
    const createCashTransaction = (data) => apiCall('/finance/cash-flow', 'POST', data);
    const getPayments = (filters) => apiCall('/finance/payments', 'GET', filters);
    const createPayment = (data) => apiCall('/finance/payments', 'POST', data);

    // 7. SUB AGENTS
    const getSubAgents = (filters) => apiCall('/sub-agents', 'GET', filters);
    const createSubAgent = (data) => apiCall('/sub-agents', 'POST', data);
    const updateSubAgent = (id, data) => apiCall(`/sub-agents/${id}`, 'PUT', data);
    const deleteSubAgent = (id) => apiCall(`/sub-agents/${id}`, 'DELETE');

    // 8. HR (Human Resources)
    const getEmployees = () => apiCall('/hr/employees', 'GET');
    
    // 9. MARKETING / LEADS
    const getLeads = (filters) => apiCall('/marketing/leads', 'GET', filters);
    
    // 10. LOGS
    const fetchLogs = (filters) => apiCall('/logs', 'GET', filters);

    // Helper Generik untuk Create/Update
    const createOrUpdate = (resource, data, id = null) => {
        if (id) return apiCall(`/${resource}/${id}`, 'PUT', data);
        return apiCall(`/${resource}`, 'POST', data);
    };

    const value = {
        loading,
        error,
        apiCall,
        getDashboardStats,
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
        createJamaah,
        updateJamaah,
        deleteJamaah,
        getFinanceStats,
        getCashFlow,
        createCashTransaction,
        getPayments,
        createPayment,
        getSubAgents,
        createSubAgent,
        updateSubAgent,
        deleteSubAgent,
        getEmployees,
        getLeads,
        fetchLogs,
        createOrUpdate
    };

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};