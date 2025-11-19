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
import MasterData from './pages/MasterData'; // Halaman Baru
import { FaHome, FaMoneyBill, FaBullhorn, FaUsers, FaBox, FaUserTie, FaDatabase } from 'react-icons/fa';

const AppContent = () => {
    const { currentUser } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');

    // Role based menu visibility
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, roles: ['owner', 'admin', 'finance', 'marketing'] },
        { id: 'packages', label: 'Paket Umroh', icon: <FaBox />, roles: ['owner', 'admin', 'marketing'] },
        { id: 'jamaah', label: 'Data Jemaah', icon: <FaUsers />, roles: ['owner', 'admin', 'marketing', 'finance'] },
        { id: 'finance', label: 'Keuangan', icon: <FaMoneyBill />, roles: ['owner', 'admin', 'finance'] },
        { id: 'marketing', label: 'Marketing Leads', icon: <FaBullhorn />, roles: ['owner', 'admin', 'marketing'] },
        { id: 'sub_agents', label: 'Sub Agen', icon: <FaUserTie />, roles: ['owner', 'admin', 'marketing'] },
        { id: 'hr', label: 'Manajemen HR', icon: <FaUsers />, roles: ['owner', 'admin'] },
        { id: 'master', label: 'Data Master', icon: <FaDatabase />, roles: ['owner', 'admin'] },
    ];

    const canAccess = (roles) => roles.includes(currentUser?.role || 'staff');

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">UmrohMgr</h1>
                    <p className="text-sm text-gray-500">Halo, {currentUser?.name}</p>
                </div>
                <nav className="mt-4">
                    {menuItems.map(item => (
                        canAccess(item.roles) && (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${activePage === item.id ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600'}`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.label}
                            </button>
                        )
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                {activePage === 'dashboard' && <Dashboard />}
                {activePage === 'packages' && <Packages />}
                {activePage === 'jamaah' && <Jamaah />}
                {activePage === 'finance' && <Finance />}
                {activePage === 'marketing' && <Marketing />}
                {activePage === 'sub_agents' && <SubAgents />}
                {activePage === 'hr' && <HR />}
                {activePage === 'master' && <MasterData />}
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