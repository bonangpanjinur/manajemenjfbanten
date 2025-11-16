import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client'; // Tetap gunakan createRoot sesuai build system Anda
import {
    Package, Users, User, Briefcase, DollarSign, List, CheckSquare, XSquare, Archive,
    Plus, Edit2, Trash2, X, AlertCircle, CheckCircle, Home, CreditCard,
    FileText, Settings, BarChart2, ChevronDown, ChevronRight, Loader, LogOut,
    Truck, UserCheck, UserX, Clock, Search, ExternalLink, SlidersHorizontal
} from 'lucide-react';

// --- STYLING (CSS-in-JS) ---
// (Tidak ada perubahan, tetap sama)
const styles = `
:root {
    --primary: #007cba;
    --primary-dark: #005a8a;
    --secondary: #f0f0f0;
    --background: #f9f9f9;
    --text: #333;
    --text-light: #777;
    --border: #e0e0e0;
    --danger: #e53e3e;
    --success: #48bb78;
    --warning: #f6ad55;
    --white: #ffffff;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--background); 
    color: var(--text); 
    margin: 0;
}
#umh-admin-app { padding: 20px; max-width: 1600px; margin: 0 auto; }
.umh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.umh-header h1 { color: var(--primary); display: flex; align-items: center; gap: 10px; margin: 0;}
.umh-nav { display: flex; gap: 5px; }
.umh-nav-button { 
    background: var(--white); 
    color: var(--text-light); 
    border: 1px solid var(--border); 
    padding: 8px 12px; 
    border-radius: 6px; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    font-weight: 500;
    transition: all 0.2s ease;
}
.umh-nav-button:hover { background-color: var(--secondary); color: var(--text); }
.umh-nav-button.active { 
    background-color: var(--primary); 
    color: var(--white); 
    border-color: var(--primary); 
}
.umh-component-container { 
    background: var(--white); 
    border-radius: 8px; 
    box-shadow: var(--shadow); 
    padding: 20px; 
    overflow: hidden;
}
.umh-table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
.umh-table-toolbar h2 { margin: 0; }
.umh-button { 
    background: var(--primary); 
    color: var(--white); 
    border: none; 
    padding: 9px 15px; 
    border-radius: 6px; 
    cursor: pointer; 
    display: inline-flex; 
    align-items: center; 
    gap: 6px; 
    font-weight: 500;
    transition: background-color 0.2s ease;
}
.umh-button:hover { background: var(--primary-dark); }
.umh-button.secondary { background: var(--secondary); color: var(--text); border: 1px solid var(--border); }
.umh-button.secondary:hover { background: var(--border); }
.umh-button.danger { background: var(--danger); }
.umh-button.danger:hover { background: #c53030; }
.umh-table-wrapper { width: 100%; overflow-x: auto; }
.umh-table { width: 100%; border-collapse: collapse; }
.umh-table th, .umh-table td { 
    padding: 12px 15px; 
    border-bottom: 1px solid var(--border); 
    text-align: left; 
    white-space: nowrap; 
}
.umh-table th { background: var(--secondary); font-weight: 600; }
.umh-table tr:last-child td { border-bottom: none; }
.umh-table tr:hover { background-color: var(--background); }
.umh-table .actions { display: flex; gap: 8px; }
.action-icon { cursor: pointer; transition: color 0.2s ease; }
.action-icon:hover { color: var(--primary); }
.action-icon.danger:hover { color: var(--danger); }
.umh-modal-overlay { 
    position: fixed; 
    top: 0; left: 0; right: 0; bottom: 0; 
    background: rgba(0, 0, 0, 0.5); 
    display: flex; 
    justify-content: center; 
    padding-top: 50px;
    z-index: 1000;
    overflow-y: auto;
}
.umh-modal-content { 
    background: var(--white); 
    border-radius: 8px; 
    padding: 25px; 
    width: 90%; 
    max-width: 800px; 
    box-shadow: var(--shadow);
    animation: modal-fade-in 0.3s ease;
    margin-bottom: 50px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
}
.umh-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.umh-modal-header h3 { margin: 0; font-size: 1.4em; }
.umh-modal-header .close-button { cursor: pointer; color: var(--text-light); }
.umh-modal-body {
    overflow-y: auto;
    padding-right: 10px; /* for scrollbar */
    margin-right: -10px;
}
.umh-modal-footer { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border); padding-top: 20px; }
@keyframes modal-fade-in { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { margin-bottom: 15px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { display: block; font-weight: 500; margin-bottom: 6px; font-size: 0.9em; }
.form-group input, .form-group select, .form-group textarea { 
    width: 100%; 
    padding: 9px 12px; 
    border: 1px solid var(--border); 
    border-radius: 6px; 
    box-sizing: border-box; 
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(0,124,186,0.2);
}
.form-group textarea { min-height: 100px; resize: vertical; }
.form-group.checkbox-group { display: flex; align-items: center; gap: 8px; }
.form-group.checkbox-group input { width: auto; }
.form-group.checkbox-group label { margin-bottom: 0; font-weight: normal; }
.loading-overlay { 
    position: absolute; 
    top: 0; left: 0; right: 0; bottom: 0; 
    background: rgba(255, 255, 255, 0.7); 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    z-index: 900;
}
.loading-overlay .loader { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.status-badge { 
    padding: 3px 8px; 
    border-radius: 12px; 
    font-size: 0.8em; 
    font-weight: 500; 
    white-space: nowrap;
}
.status-badge.pending, .status-badge.belum, .status-badge.belum_di_kirim { background: #fffbeb; color: #b45309; }
.status-badge.approved, .status-badge.lunas, .status-badge.diterima, .status-badge.published, .status-badge.verified, .status-badge.lengkap { background: #ecfdf5; color: #067647; }
.status-badge.rejected { background: #fef2f2; color: #b91c1c; }
.status-badge.cicil, .status-badge.di_kirim { background: #eff6ff; color: #1d4ed8; }
.status-badge.draft { background: #f3f4f6; color: #4b5563; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
.stat-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;
}
.stat-card:hover { box-shadow: var(--shadow); transform: translateY(-2px); }
.stat-card-icon {
    padding: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.stat-card-icon.primary { background: #e0f2fe; color: #0284c7; }
.stat-card-icon.success { background: #dcfce7; color: #16a34a; }
.stat-card-icon.warning { background: #fefce8; color: #ca8a04; }
.stat-card-icon.danger { background: #fef2f2; color: #dc2626; }
.stat-card-info h3 { font-size: 1.8em; margin: 0 0 5px 0; }
.stat-card-info p { margin: 0; color: var(--text-light); }
.umh-sub-header {
    display: flex;
    gap: 15px;
    align-items: center;
    padding: 10px;
    background-color: var(--secondary);
    border-radius: 6px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}
.umh-sub-header .filter-group { display: flex; align-items: center; gap: 8px; }
.umh-sub-header .filter-group label { font-weight: 500; font-size: 0.9em; }
.umh-sub-header .filter-group select, .umh-sub-header .filter-group input {
    background-color: var(--white);
    padding: 6px 10px;
    font-size: 0.9em;
    border: 1px solid var(--border);
    border-radius: 6px;
}
.umh-sub-header .filter-group input {
    padding-left: 30px; /* Ruang untuk ikon search */
}
.umh-sub-header .filter-group .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}
.umh-sub-header .filter-group .search-wrapper svg {
    position: absolute;
    left: 8px;
    color: var(--text-light);
}
.payment-history-list { list-style: none; padding: 0; margin: 0; }
.payment-history-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--border);
}
.payment-history-list li:last-child { border-bottom: none; }
.payment-info { display: flex; flex-direction: column; }
.payment-info strong { font-size: 1.1em; }
.payment-info span { font-size: 0.9em; color: var(--text-light); }
.payment-actions { display: flex; gap: 8px; }
.payment-form {
    padding: 15px;
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-top: 20px;
    background: var(--background);
}
.finance-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}
.summary-card {
    background: var(--secondary);
    border-radius: 8px;
    padding: 15px;
    border: 1px solid var(--border);
}
.summary-card h4 {
    margin: 0 0 10px 0;
    font-size: 1em;
    font-weight: 600;
    color: var(--text-light);
    display: flex;
    align-items: center;
    gap: 6px;
}
.summary-card p {
    margin: 0;
    font-size: 1.5em;
    font-weight: 700;
}
.summary-card p.debit { color: var(--danger); }
.summary-card p.kredit { color: var(--success); }
.summary-card p.saldo { color: var(--primary); }
`;
// --- End Styling ---


// --- API Context & Hook ---
// (Menggunakan v1.3 - tidak ada perubahan)
const ApiContext = createContext();

const useApi = () => {
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
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [api, setApi] = useState({ url: '', nonce: '', isWpAdmin: false });

    const [jamaahPayments, setJamaahPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

    const getAuthHeaders = useCallback(() => {
        const headers = { 'Content-Type': 'application/json' };
        if (api.isWpAdmin) {
            headers['X-WP-Nonce'] = api.nonce;
        } else {
            // Logika token PWA (jika ada)
        }
        return headers;
    }, [api]);

    const apiRequest = useCallback(async (endpoint, method = 'GET', body = null) => {
        const url = `${api.url}${endpoint}`;
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
                const errData = await response.json();
                throw new Error(errData.message || `Error ${response.status}`);
            }
            if (response.status === 204) return null;
            return await response.json();
        } catch (err) {
            console.error(`API Error (${method} ${endpoint}):`, err);
            setError(err.message);
            throw err;
        }
    }, [api, getAuthHeaders]);

    const fetchData = useCallback(async () => {
        if (!api.url) return;
        setLoading(true);
        try {
            const endpoints = [
                'packages', 'jamaah', 'users', 'finance', 'tasks',
                'hotels', 'flights', 'marketing/leads', 'finance/accounts'
            ];
            const results = await Promise.all(
                endpoints.map(ep => apiRequest(ep).catch(e => {
                    console.warn(`Failed to fetch ${ep}:`, e.message);
                    return []; 
                }))
            );
            
            setData({
                packages: results[0],
                jamaah: results[1],
                users: results[2],
                finance: results[3],
                tasks: results[4],
                hotels: results[5],
                flights: results[6],
                leads: results[7],
                financeAccounts: results[8], 
            });
            setError(null);
        } catch (err) {
            setError("Gagal memuat data utama.");
        } finally {
            setLoading(false);
        }
    }, [api.url, apiRequest]);

    const createItem = useCallback(async (endpoint, item, stateKey) => {
        const newItem = await apiRequest(endpoint, 'POST', item);
        setData(prev => ({
            ...prev,
            [stateKey]: [...prev[stateKey], newItem],
        }));
        return newItem;
    }, [apiRequest]);

    const updateItem = useCallback(async (endpoint, id, item, stateKey) => {
        const updatedItem = await apiRequest(`${endpoint}/${id}`, 'PUT', item);
        setData(prev => ({
            ...prev,
            [stateKey]: prev[stateKey].map(i => (i.id === id ? updatedItem : i)),
        }));
        return updatedItem;
    }, [apiRequest]);

    const deleteItem = useCallback(async (endpoint, id, stateKey) => {
        await apiRequest(`${endpoint}/${id}`, 'DELETE');
        setData(prev => ({
            ...prev,
            [stateKey]: prev[stateKey].filter(i => i.id !== id),
        }));
    }, [apiRequest]);

    const savePackage = (pkg) => {
        return pkg.id
            ? updateItem('packages', pkg.id, pkg, 'packages')
            : createItem('packages', pkg, 'packages');
    };
    const deletePackage = (id) => deleteItem('packages', id, 'packages');

    const saveJamaah = (jamaah) => {
        return jamaah.id
            ? updateItem('jamaah', jamaah.id, jamaah, 'jamaah')
            : createItem('jamaah', jamaah, 'jamaah');
    };
    const deleteJamaah = (id) => deleteItem('jamaah', id, 'jamaah');

    const saveFinance = (trx) => {
        return trx.id
            ? updateItem('finance', trx.id, trx, 'finance')
            : createItem('finance', trx, 'finance');
    };
    const deleteFinance = (id) => deleteItem('finance', id, 'finance');
    
    const saveFinanceAccount = (acc) => {
         return acc.id
            ? updateItem('finance/accounts', acc.id, acc, 'financeAccounts')
            : createItem('finance/accounts', acc, 'financeAccounts');
    };
    const deleteFinanceAccount = (id) => deleteItem('finance/accounts', id, 'financeAccounts');

    const fetchJamaahPayments = useCallback(async (jamaahId) => {
        if (!jamaahId) {
            setJamaahPayments([]);
            return;
        }
        setLoadingPayments(true);
        try {
            const payments = await apiRequest(`jamaah/${jamaahId}/payments`);
            setJamaahPayments(payments);
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
        // Refresh data jemaah
        const updatedJamaah = await apiRequest(`jamaah/${jamaahId}`);
        setData(prev => ({
            ...prev,
            jamaah: prev.jamaah.map(j => (j.id === updatedJamaah.id ? updatedJamaah : j)),
        }));
        
        return savedPayment;
    }, [apiRequest, fetchJamaahPayments]);

    const deleteJamaahPayment = useCallback(async (jamaahId, paymentId) => {
        await apiRequest(`jamaah/payments/${paymentId}`, 'DELETE');
        await fetchJamaahPayments(jamaahId);
        // Refresh data jemaah
        const updatedJamaah = await apiRequest(`jamaah/${jamaahId}`);
        setData(prev => ({
            ...prev,
            jamaah: prev.jamaah.map(j => (j.id === updatedJamaah.id ? updatedJamaah : j)),
        }));
    }, [apiRequest, fetchJamaahPayments]);


    useEffect(() => {
        if (typeof umh_wp_data !== 'undefined') {
            setApi({
                url: umh_wp_data.api_url,
                nonce: umh_wp_data.api_nonce,
                isWpAdmin: umh_wp_data.is_wp_admin,
            });
            setCurrentUser(umh_wp_data.current_user);
        }
    }, []);

    useEffect(() => {
        if (api.url) {
            fetchData();
        }
    }, [api.url, fetchData]);

    return {
        ...data,
        loading,
        error,
        currentUser,
        api,
        fetchData,
        savePackage, deletePackage,
        saveJamaah, deleteJamaah,
        saveFinance, deleteFinance,
        financeAccounts: data.financeAccounts,
        saveFinanceAccount, deleteFinanceAccount,
        jamaahPayments, loadingPayments,
        fetchJamaahPayments,
        saveJamaahPayment,
        deleteJamaahPayment,
    };
};

// --- Helper Functions ---
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-'; 
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch (e) {
        return dateString;
    }
};

const getStatusBadge = (status) => {
    const statusClass = (status || 'pending').toLowerCase()
        .replace(/ /g, '_')
        .replace(/[^a-z0-9_]/g, '');
    return <span className={`status-badge ${statusClass}`}>{status.replace(/_/g, ' ')}</span>;
};

// --- UI Components (Modular) ---

const Modal = ({ title, isOpen, onClose, children, footer, size = '800px' }) => {
    if (!isOpen) return null;

    return (
        <div className="umh-modal-overlay" onClick={onClose}>
            <div className="umh-modal-content" style={{ maxWidth: size }} onClick={e => e.stopPropagation()}>
                <div className="umh-modal-header">
                    <h3>{title}</h3>
                    <X className="close-button" onClick={onClose} />
                </div>
                <div className="umh-modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="umh-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

const ModalFooter = ({ onCancel, submitText = 'Simpan' }) => (
    <div className="umh-modal-footer">
        <button type="button" className="umh-button secondary" onClick={onCancel}>Batal</button>
        <button type="submit" className="umh-button">{submitText}</button>
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card">
        <div className={`stat-card-icon ${color}`}>
            {icon}
        </div>
        <div className="stat-card-info">
            <h3>{value}</h3>
            <p>{title}</p>
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="loading-overlay" style={{ position: 'relative', height: '300px' }}>
        <Loader size={32} className="loader" />
    </div>
);

const ErrorMessage = ({ message }) => (
    <div style={{ color: 'var(--danger)', padding: '20px', border: '1px solid var(--danger)', borderRadius: '6px' }}>
        <strong>Error:</strong> {message}
    </div>
);

// --- Page: Dashboard ---
const DashboardComponent = () => {
    const { jamaah, packages, tasks, finance, loading, error } = useContext(ApiContext);

    const stats = useMemo(() => ({
        totalJamaah: jamaah.filter(j => j.status === 'approved').length,
        totalPackages: packages.filter(p => p.status === 'published').length,
        pendingJamaah: jamaah.filter(j => j.status === 'pending').length,
        pendingTasks: tasks.filter(t => t.status !== 'completed').length,
        totalRevenue: finance.filter(t => t.transaction_type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0),
        totalExpense: finance.filter(t => t.transaction_type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0),
    }), [jamaah, packages, tasks, finance]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="dashboard-grid">
            <StatCard 
                title="Jemaah (Approved)" 
                value={stats.totalJamaah} 
                icon={<UserCheck size={24} />} 
                color="primary" 
            />
            <StatCard 
                title="Paket (Published)" 
                value={stats.totalPackages} 
                icon={<Package size={24} />} 
                color="success" 
            />
            <StatCard 
                title="Pemasukan" 
                value={formatCurrency(stats.totalRevenue)} 
                icon={<DollarSign size={24} />} 
                color="success" 
            />
             <StatCard 
                title="Pengeluaran" 
                value={formatCurrency(stats.totalExpense)} 
                icon={<CreditCard size={24} />} 
                color="danger" 
            />
            <StatCard 
                title="Jemaah (Pending)" 
                value={stats.pendingJamaah} 
                icon={<UserX size={24} />} 
                color="warning" 
            />
            <StatCard 
                title="Tugas (Pending)" 
                value={stats.pendingTasks} 
                icon={<Clock size={24} />} 
                color="warning" 
            />
        </div>
    );
};


// --- Modals (Forms) ---

const PackageForm = ({ initialData, onSubmit, onCancel }) => {
    // (Sama seperti v1.3, tidak ada perubahan)
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        status: 'draft',
        promo: 0,
        departure_city: '',
        duration: 9,
        departure_date: '',
        slots_available: 50,
        price_quad: '',
        price_triple: '',
        price_double: '',
        short_description: '',
        itinerary: '',
        meta_title: '',
        meta_description: '',
        ...initialData,
    });

    useEffect(() => {
        if (initialData && initialData.price_details) {
            try {
                const prices = JSON.parse(initialData.price_details);
                setFormData(prev => ({
                    ...prev,
                    price_quad: prices.quad || '',
                    price_triple: prices.triple || '',
                    price_double: prices.double || '',
                }));
            } catch (e) {
                console.error("Gagal parse price_details JSON:", e);
            }
        }
         if (initialData && initialData.departure_date) {
            setFormData(prev => ({
                ...prev,
                departure_date: initialData.departure_date.split('T')[0] // Format YYYY-MM-DD
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const price_details = JSON.stringify({
            quad: formData.price_quad || 0,
            triple: formData.price_triple || 0,
            double: formData.price_double || 0,
        });

        const dataToSubmit = { ...formData };
        delete dataToSubmit.price_quad;
        delete dataToSubmit.price_triple;
        delete dataToSubmit.price_double;
        
        dataToSubmit.price_details = price_details;
        
        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Judul Paket</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-group input"/>
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-group select">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Slug (URL)</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="form-group input"/>
                </div>
                
                 <div className="form-group">
                    <label>Durasi (Hari)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} required className="form-group input"/>
                </div>
                 <div className="form-group">
                    <label>Kota Keberangkatan</label>
                    <input type="text" name="departure_city" value={formData.departure_city} onChange={handleChange} className="form-group input"/>
                </div>

                <div className="form-group">
                    <label>Tanggal Keberangkatan (Opsional)</label>
                    <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} className="form-group input"/>
                </div>
                <div className="form-group">
                    <label>Jumlah Slot Tersedia</label>
                    <input type="number" name="slots_available" value={formData.slots_available} onChange={handleChange} className="form-group input"/>
                </div>

                <div className="form-group checkbox-group full-width" style={{ marginTop: '10px' }}>
                    <input type="checkbox" id="promo" name="promo" checked={!!formData.promo} onChange={handleChange} />
                    <label htmlFor="promo">Tandai sebagai Promo</label>
                </div>

                <hr className="full-width" />
                <h4 className="full-width" style={{ margin: 0 }}>Detail Harga</h4>
                 <div className="form-group">
                    <label>Harga Quad (Rp)</label>
                    <input type="number" name="price_quad" value={formData.price_quad} onChange={handleChange} className="form-group input"/>
                </div>
                 <div className="form-group">
                    <label>Harga Triple (Rp)</label>
                    <input type="number" name="price_triple" value={formData.price_triple} onChange={handleChange} className="form-group input"/>
                </div>
                 <div className="form-group">
                    <label>Harga Double (Rp)</label>
                    <input type="number" name="price_double" value={formData.price_double} onChange={handleChange} className="form-group input"/>
                </div>

                <hr className="full-width" />
                <h4 className="full-width" style={{ margin: 0 }}>Deskripsi & SEO</h4>
                <div className="form-group full-width">
                    <label>Deskripsi Singkat</label>
                    <textarea name="short_description" value={formData.short_description} onChange={handleChange} className="form-group textarea"></textarea>
                </div>
                <div className="form-group full-width">
                    <label>Itinerary (JSON/Text)</label>
                    <textarea name="itinerary" value={formData.itinerary} onChange={handleChange} className="form-group textarea"></textarea>
                </div>
                 <div className="form-group">
                    <label>Meta Title (SEO)</label>
                    <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="form-group input"/>
                </div>
                 <div className="form-group">
                    <label>Meta Description (SEO)</label>
                    <input type="text" name="meta_description" value={formData.meta_description} onChange={handleChange} className="form-group input"/>
                </div>

            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

const JamaahForm = ({ initialData, onSubmit, onCancel, packages }) => {
    // (Sama seperti v1.3, tidak ada perubahan)
    const [formData, setFormData] = useState({
        package_id: '',
        full_name: '',
        id_number: '',
        phone: '',
        email: '',
        address: '',
        gender: 'male',
        birth_date: '',
        passport_number: '',
        status: 'pending',
        total_price: '', 
        equipment_status: 'belum_di_kirim',
        is_passport_verified: false,
        is_ktp_verified: false,
        is_kk_verified: false,
        is_meningitis_verified: false,
        ...initialData,
    });
    
    // Memastikan boolean di-handle dengan benar
     useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                is_passport_verified: !!initialData.is_passport_verified,
                is_ktp_verified: !!initialData.is_ktp_verified,
                is_kk_verified: !!initialData.is_kk_verified,
                is_meningitis_verified: !!initialData.is_meningitis_verified,
                birth_date: initialData.birth_date ? initialData.birth_date.split('T')[0] : '',
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Paket yang Diambil</label>
                    <select name="package_id" value={formData.package_id} onChange={handleChange} required className="form-group select">
                        <option value="">Pilih Paket</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.title} ({formatDate(pkg.departure_date)})</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="form-group input"/>
                </div>
                 <div className="form-group">
                    <label>No. KTP (NIK)</label>
                    <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} required className="form-group input"/>
                </div>

                <div className="form-group">
                    <label>No. Telepon (WA)</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-group input"/>
                </div>
                 <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-group input"/>
                </div>

                <div className="form-group">
                    <label>Tanggal Lahir</label>
                    <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="form-group input"/>
                </div>
                <div className="form-group">
                    <label>Jenis Kelamin</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-group select">
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>No. Paspor</label>
                    <input type="text" name="passport_number" value={formData.passport_number} onChange={handleChange} className="form-group input"/>
                </div>
                <div className="form-group">
                    <label>Alamat</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-group input"/>
                </div>

                <hr className="full-width" />
                <h4 className="full-width" style={{ margin: 0 }}>Administrasi & Keuangan</h4>

                <div className="form-group">
                    <label>Status Jemaah</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-group select">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlist">Waitlist</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Total Tagihan (Rp)</label>
                    <input 
                        type="number" 
                        name="total_price" 
                        value={formData.total_price} 
                        onChange={handleChange} 
                        placeholder="Otomatis jika kosong"
                        className="form-group input"
                    />
                </div>
                
                <div className="form-group">
                    <label>Status Perlengkapan</label>
                    <select name="equipment_status" value={formData.equipment_status} onChange={handleChange} className="form-group select">
                        <option value="belum_di_kirim">Belum Dikirim</option>
                        <option value="di_kirim">Dikirim</option>
                        <option value="diterima">Diterima</option>
                    </select>
                </div>

                <hr className="full-width" />
                <h4 className="full-width" style={{ margin: 0 }}>Checklist Verifikasi Dokumen (Admin)</h4>

                <div className="form-group checkbox-group">
                    <input type="checkbox" id="is_passport_verified" name="is_passport_verified" checked={!!formData.is_passport_verified} onChange={handleChange} />
                    <label htmlFor="is_passport_verified">Paspor Verified</label>
                </div>
                <div className="form-group checkbox-group">
                    <input type="checkbox" id="is_ktp_verified" name="is_ktp_verified" checked={!!formData.is_ktp_verified} onChange={handleChange} />
                    <label htmlFor="is_ktp_verified">KTP Verified</label>
                </div>
                <div className="form-group checkbox-group">
                    <input type="checkbox" id="is_kk_verified" name="is_kk_verified" checked={!!formData.is_kk_verified} onChange={handleChange} />
                    <label htmlFor="is_kk_verified">KK Verified</label>
                </div>
                 <div className="form-group checkbox-group">
                    <input type="checkbox" id="is_meningitis_verified" name="is_meningitis_verified" checked={!!formData.is_meningitis_verified} onChange={handleChange} />
                    <label htmlFor="is_meningitis_verified">Meningitis Verified</label>
                </div>

            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

const JamaahPaymentsModal = ({ isOpen, onClose, jamaah, api }) => {
    // (Sama seperti v1.3, tidak ada perubahan)
    const { 
        jamaahPayments, 
        loadingPayments, 
        fetchJamaahPayments, 
        saveJamaahPayment, 
        deleteJamaahPayment 
    } = api;
    
    const [newPayment, setNewPayment] = useState({
        amount: '',
        description: '',
        payment_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (isOpen && jamaah) {
            fetchJamaahPayments(jamaah.id);
        } else {
            fetchJamaahPayments(null);
        }
    }, [isOpen, jamaah, fetchJamaahPayments]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPayment(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewPayment = async (e) => {
        e.preventDefault();
        if (!newPayment.amount || !newPayment.payment_date) {
            alert("Jumlah dan Tanggal wajib diisi.");
            return;
        }
        try {
            await saveJamaahPayment(jamaah.id, newPayment);
            setNewPayment({
                amount: '',
                description: '',
                payment_date: new Date().toISOString().split('T')[0],
            });
        } catch (error) {
            alert(`Gagal menyimpan: ${error.message}`);
        }
    };

    const handleVerifyPayment = async (payment) => {
        if (!confirm("Anda yakin ingin MEMVERIFIKASI pembayaran ini?")) return;
        try {
            await saveJamaahPayment(jamaah.id, { ...payment, status: 'verified' });
        } catch (error) {
            alert(`Gagal verifikasi: ${error.message}`);
        }
    };
    
    const handleRejectPayment = async (payment) => {
         if (!confirm("Anda yakin ingin MENOLAK pembayaran ini?")) return;
        try {
            await saveJamaahPayment(jamaah.id, { ...payment, status: 'rejected' });
        } catch (error) {
            alert(`Gagal menolak: ${error.message}`);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (!confirm("Anda yakin ingin MENGHAPUS riwayat pembayaran ini? Ini tidak bisa dikembalikan.")) return;
        try {
            await deleteJamaahPayment(jamaah.id, paymentId);
        } catch (error) {
            alert(`Gagal menghapus: ${error.message}`);
        }
    };
    
    if (!jamaah) return null;

    const sisaTagihan = (jamaah.total_price || 0) - (jamaah.amount_paid || 0);

    return (
        <Modal 
            title={`Riwayat Pembayaran: ${jamaah.full_name}`} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            {loadingPayments && <p>Memuat riwayat...</p>}
            
            <div className="finance-summary" style={{ marginBottom: '20px' }}>
                 <div className="summary-card">
                    <h4>Total Tagihan</h4>
                    <p>{formatCurrency(jamaah.total_price)}</p>
                </div>
                 <div className="summary-card">
                    <h4>Total Terbayar (Verified)</h4>
                    <p className="kredit">{formatCurrency(jamaah.amount_paid)}</p>
                </div>
                 <div className="summary-card">
                    <h4>Sisa Tagihan</h4>
                    <p className="debit">{formatCurrency(sisaTagihan)}</p>
                </div>
            </div>

            <h4 style={{ margin: '15px 0 10px 0' }}>Riwayat Transaksi</h4>
            <ul className="payment-history-list">
                {jamaahPayments.length === 0 && !loadingPayments && <li>Tidak ada riwayat pembayaran.</li>}
                {jamaahPayments.map(p => (
                    <li key={p.id}>
                        <div className="payment-info">
                            <strong>{formatCurrency(p.amount)}</strong>
                            <span>{p.description || 'Pembayaran'} - {formatDate(p.payment_date)}</span>
                        </div>
                        <div className="payment-actions">
                            {getStatusBadge(p.status)}
                            {p.status === 'pending' && (
                                <>
                                <button 
                                    className="umh-button" 
                                    style={{ padding: '4px 8px', fontSize: '0.8em', background: 'var(--success)'}}
                                    onClick={() => handleVerifyPayment(p)}
                                >
                                    <CheckCircle size={14} /> Verifikasi
                                </button>
                                <button 
                                    className="umh-button secondary" 
                                    style={{ padding: '4px 8px', fontSize: '0.8em', background: 'var(--warning)'}}
                                    onClick={() => handleRejectPayment(p)}
                                >
                                    <XSquare size={14} /> Tolak
                                </button>
                                </>
                            )}
                             <Trash2 
                                size={18} 
                                className="action-icon danger" 
                                onClick={() => handleDeletePayment(p.id)} 
                            />
                        </div>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleAddNewPayment} className="payment-form">
                <h4 style={{ margin: '0 0 15px 0' }}>Tambah Pembayaran Baru</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Jumlah (Rp)</label>
                        <input
                            type="number"
                            name="amount"
                            value={newPayment.amount}
                            onChange={handleInputChange}
                            required
                            className="form-group input"
                        />
                    </div>
                     <div className="form-group">
                        <label>Tanggal Bayar</label>
                        <input
                            type="date"
                            name="payment_date"
                            value={newPayment.payment_date}
                            onChange={handleInputChange}
                            required
                            className="form-group input"
                        />
                    </div>
                </div>
                <div className="form-group full-width">
                    <label>Keterangan (Cth: DP, Cicilan 1, Pelunasan)</label>
                    <input
                        type="text"
                        name="description"
                        value={newPayment.description}
                        onChange={handleInputChange}
                        className="form-group input"
                    />
                </div>
                <button type="submit" className="umh-button">
                    <Plus size={16} /> Tambah
                </button>
            </form>
        </Modal>
    );
};

const FinanceForm = ({ initialData, onSubmit, onCancel, accounts }) => {
    // (Sama seperti v1.3, tidak ada perubahan)
    const [formData, setFormData] = useState({
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        transaction_type: 'expense',
        amount: '',
        account_id: '', 
        ...initialData,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group">
                    <label>Tanggal</label>
                    <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required className="form-group input"/>
                </div>
                
                <div className="form-group">
                    <label>Akun</label>
                    <select name="account_id" value={formData.account_id} onChange={handleChange} required className="form-group select">
                        <option value="">Pilih Akun Kas</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>
                
                 <div className="form-group">
                    <label>Jenis Transaksi</label>
                    <select name="transaction_type" value={formData.transaction_type} onChange={handleChange} required className="form-group select">
                        <option value="expense">Debit (Pengeluaran)</option>
                        <option value="income">Kredit (Pemasukan)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Jumlah (Rp)</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="form-group input"/>
                </div>

                <div className="form-group full-width">
                    <label>Deskripsi</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} className="form-group input"/>
                </div>
            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};


// --- Page: Paket ---
const PackagesComponent = () => {
    const { packages, savePackage, deletePackage, loading, error, fetchData } = useContext(ApiContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const handleOpenModal = (pkg = null) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPackage(null);
    };

    const handleSave = async (pkg) => {
        try {
            await savePackage(pkg);
            handleCloseModal();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus paket ini?')) {
            try {
                await deletePackage(id);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };
    
    const getLowestPrice = (priceDetailsJson) => {
        if (!priceDetailsJson) return 0;
        try {
            const prices = JSON.parse(priceDetailsJson);
            return prices.quad || prices.triple || prices.double || 0;
        } catch(e) {
            return 0;
        }
    };

    return (
        <div className="umh-component-container">
            <div className="umh-table-toolbar">
                <h2>Manajemen Paket</h2>
                <button className="umh-button" onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Tambah Paket
                </button>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="umh-table-wrapper">
                    <table className="umh-table">
                        <thead>
                            <tr>
                                <th>Judul Paket</th>
                                <th>Status</th>
                                <th>Tgl Berangkat</th>
                                <th>Durasi</th>
                                <th>Kota</th>
                                <th>Harga Mulai (Quad)</th>
                                <th>Slot</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.length === 0 && <tr><td colSpan="8">Tidak ada paket.</td></tr>}
                            {packages.map(pkg => (
                                <tr key={pkg.id}>
                                    <td>{pkg.title}</td>
                                    <td>{getStatusBadge(pkg.status)}</td>
                                    <td>{formatDate(pkg.departure_date)}</td>
                                    <td>{pkg.duration} Hari</td>
                                    <td>{pkg.departure_city}</td>
                                    <td>{formatCurrency(getLowestPrice(pkg.price_details))}</td>
                                    <td>{pkg.slots_filled || 0} / {pkg.slots_available || 0}</td>
                                    <td className="actions">
                                        <Edit2 size={18} className="action-icon" onClick={() => handleOpenModal(pkg)} />
                                        <Trash2 size={18} className="action-icon danger" onClick={() => handleDelete(pkg.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                title={selectedPackage ? 'Edit Paket' : 'Tambah Paket Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            >
                <PackageForm
                    initialData={selectedPackage}
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};


// --- Page: Jemaah (REFAKTOR + FITUR BARU) ---
const JamaahComponent = ({ onOpenPayments }) => {
    const { jamaah, packages, saveJamaah, deleteJamaah, loading, error, fetchData } = useContext(ApiContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJamaah, setSelectedJamaah] = useState(null);
    
    // (BARU) State untuk filter
    const [filterPackage, setFilterPackage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (jamaah = null) => {
        setSelectedJamaah(jamaah);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedJamaah(null);
    };

    const handleSave = async (jamaah) => {
        try {
            await saveJamaah(jamaah);
            handleCloseModal();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus jemaah ini? Semua data pembayaran terkait akan ikut terhapus.')) {
            try {
                await deleteJamaah(id);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };
    
    const getDocumentStatus = (j) => {
        const totalDocs = 4;
        let verifiedDocs = 0;
        if (j.is_passport_verified) verifiedDocs++;
        if (j.is_ktp_verified) verifiedDocs++;
        if (j.is_kk_verified) verifiedDocs++;
        if (j.is_meningitis_verified) verifiedDocs++;
        
        if (verifiedDocs === totalDocs) return getStatusBadge('Lengkap');
        if (verifiedDocs > 0) return getStatusBadge(`${verifiedDocs}/${totalDocs}`);
        return getStatusBadge('Belum');
    };

    // (BARU) Logika filter dan search
    const filteredJamaah = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        
        return jamaah.filter(j => {
            // Filter Paket
            if (filterPackage && j.package_id != filterPackage) {
                return false;
            }
            
            // Filter Search
            if (searchTerm) {
                return (
                    j.full_name?.toLowerCase().includes(lowerSearch) ||
                    j.id_number?.toLowerCase().includes(lowerSearch) ||
                    j.phone?.toLowerCase().includes(lowerSearch) ||
                    j.email?.toLowerCase().includes(lowerSearch)
                );
            }
            
            return true; // Lolos semua filter
        });
    }, [jamaah, filterPackage, searchTerm]);

    return (
        <div className="umh-component-container">
            <div className="umh-table-toolbar">
                <h2>Manajemen Jemaah</h2>
                <button className="umh-button" onClick={() => handleOpenModal()}>
                    <User size={16} /> Tambah Jemaah
                </button>
            </div>

            {/* (BARU) Toolbar Filter & Search */}
            <div className="umh-sub-header">
                <div className="filter-group">
                    <label htmlFor="search-jemaah">Cari Jemaah:</label>
                    <div className="search-wrapper">
                        <Search size={16} />
                        <input 
                            id="search-jemaah"
                            type="text"
                            placeholder="Nama, NIK, HP, Email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <label htmlFor="filter-paket">Filter Paket:</label>
                    <select 
                        id="filter-paket"
                        value={filterPackage} 
                        onChange={e => setFilterPackage(e.target.value)}
                    >
                        <option value="">Semua Paket</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.title} ({formatDate(pkg.departure_date)})</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="umh-table-wrapper">
                    <table className="umh-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Paket</th>
                                <th>Status Bayar</th>
                                <th>Sisa Tagihan</th>
                                <th>Dokumen</th>
                                <th>Perlengkapan</th>
                                <th>Kontak</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJamaah.length === 0 && <tr><td colSpan="8" className="text-center p-4">Tidak ada jemaah yang cocok.</td></tr>}
                            {filteredJamaah.map(j => {
                                const sisa = (j.total_price || 0) - (j.amount_paid || 0);
                                return (
                                    <tr key={j.id}>
                                        <td>{j.full_name}</td>
                                        <td>{j.package_name || '...'}</td>
                                        <td>{getStatusBadge(j.payment_status)}</td>
                                        <td style={{ color: sisa > 0 ? 'var(--danger)' : 'var(--success)'}}>
                                            {formatCurrency(sisa)}
                                        </td>
                                        <td>{getDocumentStatus(j)}</td>
                                        <td>{getStatusBadge(j.equipment_status)}</td>
                                        <td>{j.phone}</td>
                                        <td className="actions">
                                            <button 
                                                className="umh-button" 
                                                style={{ padding: '4px 8px', fontSize: '0.8em'}}
                                                onClick={() => onOpenPayments(j)}
                                            >
                                                <CreditCard size={14} /> Bayar
                                            </button>
                                            <Edit2 size={18} className="action-icon" onClick={() => handleOpenModal(j)} />
                                            <Trash2 size={18} className="action-icon danger" onClick={() => handleDelete(j.id)} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                title={selectedJamaah ? 'Edit Jemaah' : 'Tambah Jemaah Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            >
                <JamaahForm
                    initialData={selectedJamaah}
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                    packages={packages}
                />
            </Modal>
        </div>
    );
};


// --- Page: Keuangan (REFAKTOR) ---
const FinanceComponent = () => {
    const { finance, financeAccounts, saveFinance, deleteFinance, loading, error, fetchData } = useContext(ApiContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState(''); 

    const handleOpenModal = (trx = null) => {
        setSelectedTrx(trx);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTrx(null);
    };

    const handleSave = async (trx) => {
        try {
            await saveFinance(trx);
            handleCloseModal();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
            try {
                await deleteFinance(id);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };

    const kasData = useMemo(() => {
        const filtered = finance
            .filter(trx => selectedAccountId ? trx.account_id == selectedAccountId : true)
            .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));
        
        let totalDebit = 0;
        let totalKredit = 0;
        let runningBalance = 0;

        const transactionsWithBalance = filtered.map(trx => {
            const amount = parseFloat(trx.amount) || 0;
            let debit = 0;
            let kredit = 0;

            if (trx.transaction_type === 'expense') {
                debit = amount;
                totalDebit += amount;
                runningBalance -= amount;
            } else {
                kredit = amount;
                totalKredit += amount;
                runningBalance += amount;
            }
            
            return { ...trx, debit, kredit, balance: runningBalance };
        });

        return {
            transactions: transactionsWithBalance.reverse(), 
            totalDebit,
            totalKredit,
            saldoAkhir: runningBalance,
        };
    }, [finance, selectedAccountId]);

    return (
        <div className="umh-component-container">
            <div className="umh-table-toolbar">
                <h2>Buku Kas</h2>
                <button className="umh-button" onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Catat Transaksi
                </button>
            </div>

            <div className="umh-sub-header">
                <div className="filter-group">
                    <label>Tampilkan Akun:</label>
                    <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>
                        <option value="">Semua Akun Kas</option>
                        {financeAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="finance-summary">
                <div className="summary-card">
                    <h4><CheckCircle size={16} /> Total Kredit (Masuk)</h4>
                    <p className="kredit">{formatCurrency(kasData.totalKredit)}</p>
                </div>
                 <div className="summary-card">
                    <h4><AlertCircle size={16} /> Total Debit (Keluar)</h4>
                    <p className="debit">{formatCurrency(kasData.totalDebit)}</p>
                </div>
                 <div className="summary-card">
                    <h4><DollarSign size={16} /> Saldo Akhir</h4>
                    <p className="saldo">{formatCurrency(kasData.saldoAkhir)}</p>
                </div>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="umh-table-wrapper">
                    <table className="umh-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Deskripsi</th>
                                <th>Akun</th>
                                <th>Debit</th>
                                <th>Kredit</th>
                                <th>Saldo</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kasData.transactions.length === 0 && <tr><td colSpan="7">Tidak ada transaksi.</td></tr>}
                            {kasData.transactions.map(trx => {
                                const account = financeAccounts.find(a => a.id == trx.account_id);
                                return (
                                    <tr key={trx.id}>
                                        <td>{formatDate(trx.transaction_date)}</td>
                                        <td>{trx.description}</td>
                                        <td>{account ? account.name : 'N/A'}</td>
                                        <td>{trx.debit ? formatCurrency(trx.debit) : '-'}</td>
                                        <td>{trx.kredit ? formatCurrency(trx.kredit) : '-'}</td>
                                        <td>{formatCurrency(trx.balance)}</td>
                                        <td className="actions">
                                            <Edit2 size={18} className="action-icon" onClick={() => handleOpenModal(trx)} />
                                            <Trash2 size={18} className="action-icon danger" onClick={() => handleDelete(trx.id)} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                title={selectedTrx ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            >
                <FinanceForm
                    initialData={selectedTrx}
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                    accounts={financeAccounts}
                />
            </Modal>
        </div>
    );
};


// --- Page: HR, Marketing, Logs (Placeholders) ---
const HRComponent = () => (
    <div className="umh-component-container">
        <h2>Manajemen HR</h2>
        <p>Fitur HR (Gaji, Absensi, Karyawan) sedang dalam pengembangan.</p>
    </div>
);
const MarketingComponent = () => (
     <div className="umh-component-container">
        <h2>Manajemen Marketing</h2>
        <p>Fitur Marketing (Leads, Campaign) sedang dalam pengembangan.</p>
    </div>
);
const LogComponent = () => (
     <div className="umh-component-container">
        <h2>Log Aktivitas</h2>
        <p>Fitur Log sedang dalam pengembangan.</p>
    </div>
);


// --- Komponen App Utama (Router & Layout) ---
const App = () => {
    const { currentUser, isLoading, login, logout, api } = useContext(ApiContext);
    const [activeView, setActiveView] = useState('dashboard');
    
    // State untuk modal pembayaran
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedJamaahForPayments, setSelectedJamaahForPayments] = useState(null);

    const handleOpenPayments = (jamaah) => {
        setSelectedJamaahForPayments(jamaah);
        setIsPaymentModalOpen(true);
    };

    const handleClosePayments = () => {
        setSelectedJamaahForPayments(null);
        setIsPaymentModalOpen(false);
    };

    // Tampilkan loading screen utama
    if (isLoading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Loader size={48} className="loader" />
            </div>
        );
    }
    
    // Jika tidak loading dan tidak ada user, tampilkan login
    if (!currentUser) {
        // Tampilkan login form
        return <div>Login Form Here...</div>; // TODO: Integrasikan Login Form
    }
    
    // Tampilkan App Utama
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardComponent />;
            case 'packages': return <PackagesComponent />;
            case 'jamaah': return <JamaahComponent onOpenPayments={handleOpenPayments} />;
            case 'finance': return <FinanceComponent />;
            case 'hr': return <HRComponent />;
            case 'marketing': return <MarketingComponent />;
            case 'logs': return <LogComponent />;
            default: return <DashboardComponent />;
        }
    };

    const NavButton = ({ view, icon, label }) => (
        <button
            className={`umh-nav-button ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)}
        >
            {icon} {label}
        </button>
    );
    
    const canAccess = (module) => {
        const role = currentUser?.role || 'staff';
        if (role === 'super_admin' || role === 'owner') return true;
        
        const permissions = {
            dashboard: ['admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
            packages: ['admin_staff'],
            jamaah: ['admin_staff'],
            finance: ['finance_staff'],
            hr: ['hr_staff'],
            marketing: ['marketing_staff'],
            logs: ['admin_staff'],
        };
        
        return permissions[module]?.includes(role);
    };

    return (
        <>
            <style>{styles}</style>
            
            <div className="umh-header">
                <h1><Briefcase /> Umroh Manager</h1>
                <div className="flex items-center gap-4">
                     <span className="text-sm text-gray-600">
                        Halo, <strong>{currentUser?.full_name || currentUser?.email}</strong> ({currentUser?.role})
                     </span>
                    <button className="umh-nav-button" onClick={logout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            
            </div>
            <nav className="umh-nav" style={{ marginBottom: '20px' }}>
                <NavButton view="dashboard" icon={<Home size={16} />} label="Dashboard" />
                <NavButton view="packages" icon={<Package size={16} />} label="Paket" />
                <NavButton view="jamaah" icon={<Users size={16} />} label="Jemaah" />
                <NavButton view="finance" icon={<DollarSign size={16} />} label="Keuangan" />
                <NavButton view="hr" icon={<Briefcase size={16} />} label="HR" />
                <NavButton view="marketing" icon={<BarChart2 size={16} />} label="Marketing" />
                <NavButton view="logs" icon={<FileText size={16} />} label="Logs" />
            </nav>

            {/* Konten Halaman */}
            <div>
                {renderView()}
            </div>
            
            {/* Modal Pembayaran (Global) */}
            <JamaahPaymentsModal
                isOpen={isPaymentModalOpen}
                onClose={handleClosePayments}
                jamaah={selectedJamaahForPayments}
                api={useContext(ApiContext)}
            />
        </>
    );
};


// --- Komponen Login & Root ---
// Komponen Root yang menangani Auth vs App
const AppRoot = () => {
    const { currentUser, isLoading, login } = useContext(ApiContext);

    if (isLoading) {
         return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif'}}>
                <Loader size={48} className="loader" />
                <style>{styles}</style> {/* Pastikan style global dimuat */}
            </div>
        );
    }

    if (!currentUser) {
        // Tampilkan login form jika tidak ada user
        return (
            <>
                <style>{styles}</style>
                {/* Ganti ini dengan komponen login Anda jika perlu */}
                <div>Loading Login...</div> 
            </>
        );
    }

    // Tampilkan App Utama jika sudah login
    return <App />;
}

// --- Render Aplikasi ---
document.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('umh-admin-app');
    if (rootEl) {
        // Muat Tailwind CSS
        if (!document.getElementById('tailwind-css')) {
            const tailwindScript = document.createElement('script');
            tailwindScript.id = 'tailwind-css';
            tailwindScript.src = 'https://cdn.tailwindcss.com';
            document.head.appendChild(tailwindScript);
        }
        
        const root = createRoot(rootEl);
        root.render(
            <AuthProvider>
                <AppRoot />
            </AuthProvider>
        );
    }
});

// --- Styles untuk Login & Loading (jika diperlukan di luar App) ---
// (Ini bisa dihapus jika login form ada di dalam AppRoot)