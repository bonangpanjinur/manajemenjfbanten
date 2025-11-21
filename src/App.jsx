import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';

// Import Halaman Asli
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import HR from './pages/HR';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import SubAgents from './pages/SubAgents';
import MasterData from './pages/MasterData';

// Import Icons (Menggunakan Lucide untuk konsistensi dengan desain baru)
import { 
    LayoutDashboard, Package, Users, Wallet, 
    Megaphone, Briefcase, Database, Network,
    Menu, X, Bell
} from 'lucide-react';

const AppContent = () => {
    const { currentUser } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Konfigurasi Menu
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['owner', 'administrator', 'admin_staff', 'finance_staff', 'marketing_staff'] },
        { id: 'packages', label: 'Paket', icon: <Package size={18} />, roles: ['owner', 'administrator', 'admin_staff', 'marketing_staff'] },
        { id: 'jamaah', label: 'Jamaah', icon: <Users size={18} />, roles: ['owner', 'administrator', 'admin_staff', 'marketing_staff', 'finance_staff'] },
        { id: 'finance', label: 'Keuangan', icon: <Wallet size={18} />, roles: ['owner', 'administrator', 'finance_staff', 'admin_staff'] },
        { id: 'marketing', label: 'Marketing', icon: <Megaphone size={18} />, roles: ['owner', 'administrator', 'admin_staff', 'marketing_staff'] },
        { id: 'sub_agents', label: 'Agen', icon: <Network size={18} />, roles: ['owner', 'administrator', 'admin_staff', 'marketing_staff'] },
        { id: 'hr', label: 'HR', icon: <Briefcase size={18} />, roles: ['owner', 'administrator'] },
        { id: 'master', label: 'Master', icon: <Database size={18} />, roles: ['owner', 'administrator', 'admin_staff'] },
    ];

    const userRole = currentUser?.role || 'subscriber';
    
    // Helper Cek Akses
    const canAccess = (allowedRoles) => {
        // Jika user adalah admin WP asli, izinkan semua
        if (currentUser?.role === 'administrator') return true;
        return allowedRoles.includes(userRole);
    };

    // Router Sederhana
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
        // Wrapper ID ini penting untuk CSS Scoping
        <div id="umh-admin-app" className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800">
            
            {/* HEADER & NAVIGASI */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
                    {/* Kiri: Logo */}
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
                            <LayoutDashboard size={24} />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-gray-900 leading-none">Umroh Manager</h1>
                            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Hybrid v1.2</span>
                        </div>
                    </div>

                    {/* Kanan: User Profile */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {currentUser?.full_name || 'Pengguna'}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                {userRole.replace(/_/g, ' ')}
                            </p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        
                        {/* Mobile Menu Toggle */}
                        <button className="md:hidden p-2 text-gray-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* TAB MENU (Desktop) */}
                <div className="hidden md:block px-4 sm:px-6 bg-gray-50/50 border-t border-gray-100 backdrop-blur-sm">
                    <nav className="flex space-x-1 overflow-x-auto custom-scrollbar">
                        {menuItems.map(item => (
                            canAccess(item.roles) && (
                                <button
                                    key={item.id}
                                    onClick={() => setActivePage(item.id)}
                                    className={`
                                        group flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 text-sm font-medium transition-all duration-200
                                        ${activePage === item.id 
                                            ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-sm' 
                                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 rounded-t-lg'
                                        }
                                    `}
                                >
                                    <span className={activePage === item.id ? 'text-blue-600' : 'text-gray-400'}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </button>
                            )
                        ))}
                    </nav>
                </div>
            </header>

            {/* MOBILE MENU (Overlay) */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 shadow-lg z-30 p-2 space-y-1">
                    {menuItems.map(item => (
                        canAccess(item.roles) && (
                            <button
                                key={item.id}
                                onClick={() => { setActivePage(item.id); setIsMobileMenuOpen(false); }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left
                                    ${activePage === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {item.icon} {item.label}
                            </button>
                        )
                    ))}
                </div>
            )}

            {/* KONTEN HALAMAN */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50/50">
                <div className="max-w-7xl mx-auto min-h-[500px]">
                    {renderPage()}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} PT. Jannah Firdaus Banten. All rights reserved.
                </div>
            </footer>
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