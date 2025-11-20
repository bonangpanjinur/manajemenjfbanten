import React, { createContext, useContext, useState, useCallback } from 'react';

const ApiContext = createContext();
export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const { apiUrl, nonce } = window.umh_wp_data || { apiUrl: '', nonce: '' };

    const apiCall = useCallback(async (endpoint, method = 'GET', body = null) => {
        setLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce };
            const config = { method, headers, body: body ? JSON.stringify(body) : null };
            
            let url = `${apiUrl}${endpoint}`;
            if (method === 'GET' && body) {
                url += '?' + new URLSearchParams(body).toString();
                delete config.body;
            }

            const res = await fetch(url, config);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error Request');
            return data;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiUrl, nonce]);

    // --- API METHODS ---
    // HR
    const getEmployees = () => apiCall('/hr/employees');
    const submitBulkAttendance = (data) => apiCall('/hr/attendance/bulk', 'POST', data);
    const requestKasbon = (data) => apiCall('/hr/kasbon', 'POST', data);
    const getPayrollPreview = (id, month) => apiCall(`/hr/payroll/preview/${id}`, 'GET', { month });
    
    // Tasks
    const getTasks = (userId) => apiCall('/tasks', 'GET', { user_id: userId });
    const createTask = (data) => apiCall('/tasks', 'POST', data);
    const updateTaskStatus = (id, status) => apiCall(`/tasks/${id}`, 'PUT', { status });
    const submitWorkReport = (data) => apiCall('/reports', 'POST', data);

    // Standard CRUD
    const createOrUpdate = (resource, data, id = null) => {
        return id ? apiCall(`/${resource}/${id}`, 'PUT', data) : apiCall(`/${resource}`, 'POST', data);
    };
    const deleteItem = (resource, id) => apiCall(`/${resource}/${id}`, 'DELETE');

    // Dashboard Stats
    const getDashboardStats = () => apiCall('/stats/dashboard');

    return (
        <ApiContext.Provider value={{ 
            loading, apiCall, createOrUpdate, deleteItem, 
            getDashboardStats, getEmployees, submitBulkAttendance, 
            requestKasbon, getPayrollPreview, getTasks, createTask, 
            updateTaskStatus, submitWorkReport 
        }}>
            {children}
        </ApiContext.Provider>
    );
};