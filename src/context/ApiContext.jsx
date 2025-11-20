// File Location: src/context/ApiContext.jsx

import React, { createContext, useContext, useState, useCallback } from 'react';

const ApiContext = createContext();
export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const { apiUrl, nonce } = window.umh_wp_data || { apiUrl: '/wp-json/umh/v1', nonce: '' };

    const apiCall = useCallback(async (endpoint, method = 'GET', body = null) => {
        setLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce };
            const config = { method, headers };
            if (body) config.body = JSON.stringify(body);
            
            let url = `${apiUrl}${endpoint}`;
            if (method === 'GET' && body) {
                url += '?' + new URLSearchParams(body).toString();
                delete config.body;
            }

            const res = await fetch(url, config);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Request failed');
            return data;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiUrl, nonce]);

    // EXPORT METHODS
    const getJamaahList = (f) => apiCall('/jamaah', 'GET', f);
    const createJamaah = (d) => apiCall('/jamaah', 'POST', d);
    const updateJamaah = (id, d) => apiCall(`/jamaah/${id}`, 'PUT', d);
    const deleteJamaah = (id) => apiCall(`/jamaah/${id}`, 'DELETE');

    const getPackages = (f) => apiCall('/packages', 'GET', f);
    const createPackage = (d) => apiCall('/packages', 'POST', d);

    const getFinanceStats = () => apiCall('/finance/stats');
    const getCashFlow = (f) => apiCall('/finance/cash-flow', 'GET', f);
    const getPayments = () => apiCall('/finance/payments');
    const createCashTransaction = (d) => apiCall('/finance/cash-flow', 'POST', d);
    const createPayment = (d) => apiCall('/finance/payments', 'POST', d);

    const getMasterData = (t) => apiCall('/master-data', 'GET', { type: t });
    const createMasterData = (d) => apiCall('/master-data', 'POST', d);
    const deleteMasterData = (id) => apiCall(`/master-data/${id}`, 'DELETE');

    const getLeads = () => apiCall('/marketing');
    const createOrUpdate = (res, d, id) => id ? apiCall(`/${res}/${id}`, 'PUT', d) : apiCall(`/${res}`, 'POST', d);

    const getEmployees = () => apiCall('/hr/employees');
    const getDashboardStats = () => apiCall('/stats/dashboard');

    return (
        <ApiContext.Provider value={{ 
            loading, apiCall, 
            getJamaahList, createJamaah, updateJamaah, deleteJamaah,
            getPackages, createPackage,
            getFinanceStats, getCashFlow, getPayments, createCashTransaction, createPayment,
            getMasterData, createMasterData, deleteMasterData,
            getLeads, createOrUpdate, getEmployees, getDashboardStats
        }}>
            {children}
        </ApiContext.Provider>
    );
};