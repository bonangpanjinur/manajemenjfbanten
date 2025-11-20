import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import HR from './pages/HR';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import SubAgents from './pages/SubAgents';
import MasterData from './pages/MasterData';
import { FaHome, FaMoneyBill, FaBullhorn, FaUsers, FaBox, FaUserTie, FaDatabase } from 'react-icons/fa';

const AppContent = () => {
    const { currentUser } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');

    // Definisi Menu dan Role Akses
    // Pastikan slug role ini sama persis dengan yang ada di database WordPress (wp_usermeta -> capabilities)
    const menuItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: <FaHome />, 
            roles: ['owner', 'administrator', 'admin_staff', 'finance_staff', 'marketing_staff'] 
        },
        { 
            id: 'packages', 
            label: 'Paket Umroh', 
            icon: <FaBox />, 
            roles: ['owner', 'administrator', 'admin_staff', 'marketing_staff'] 
        },
        { 
            id: 'jamaah', 
            label: 'Data Jemaah', 
            icon: <FaUsers />, 
            roles: ['owner', 'administrator', 'admin_staff', 'marketing_staff', 'finance_staff'] 
        },
        { 
            id: 'finance', 
            label: 'Keuangan', 
            icon: <FaMoneyBill />, 
            roles: ['owner', 'administrator', 'finance_staff', 'admin_staff'] 
        },
        { 
            id: 'marketing', 
            label: 'Marketing Leads', 
            icon: <FaBullhorn />, 
            roles: ['owner', 'administrator', 'admin_staff', 'marketing_staff'] 
        },
        { 
            id: 'sub_agents', 
            label: 'Sub Agen', 
            icon: <FaUserTie />, 
            roles: ['owner', 'administrator', 'admin_staff', 'marketing_staff'] 
        },
        { 
            id: 'hr', 
            label: 'Manajemen HR', 
            icon: <FaUsers />, 
            roles: ['owner', 'administrator'] 
        },
        { 
            id: 'master', 
            label: 'Data Master', 
            icon: <FaDatabase />, 
            roles: ['owner', 'administrator', 'admin_staff'] 
        },
    ];

    // Helper: Cek apakah role user saat ini ada di dalam array roles yang diizinkan
    const userRole = currentUser?.role || '';
    const canAccess = (allowedRoles) => allowedRoles.includes(userRole);

    // Render Halaman
    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'packages': return <Packages />;
            case 'jamaah': return <Jamaah />;
            case 'finance': return <Finance />;
            case 'marketing': return <Marketing />;
            case 'sub_agents': return <SubAgents />;
            case 'hr': return <HR />;
            case 'master': return <MasterData />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-xl z-20 flex flex-col fixed h-full md:relative hidden md:flex">
                <div className="p-6 border-b flex flex-col items-start">
                    <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">UmrohMgr</h1>
                    <div className="mt-4 w-full">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {currentUser?.full_name || 'Pengguna'}
                        </p>
                        <span className="mt-1 inline-block px-2 py-0.5 text-xs font-bold text-blue-800 bg-blue-100 rounded-full uppercase">
                            {userRole.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                    {menuItems.map(item => (
                        canAccess(item.roles) && (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 
                                    ${activePage === item.id 
                                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className={`mr-3 text-lg ${activePage === item.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </button>
                        )
                    ))}
                </nav>

                <div className="p-4 border-t bg-gray-50">
                    <p className="text-xs text-center text-gray-400">
                        &copy; {new Date().getFullYear()} JF Banten v1.1
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50 w-full p-4 md:p-0">
                {renderPage()}
            </main>
        </div>
    );
};

const App = () => (
    <AuthProvider>
        <ApiProvider>
            <AppContent />
        </ApiProvider>
    </AuthProvider>
);

export default App;