import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import { 
    LayoutDashboard, 
    Package, 
    Users, 
    BedDouble, 
    Briefcase, 
    Building2, 
    Clock, 
    Wallet, 
    UserCog, 
    Network, 
    Settings, 
    ScrollText, 
    LogOut 
} from 'lucide-react';

// Import Pages
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import SubAgents from './pages/SubAgents';
import Finance from './pages/Finance';
import HR from './pages/HR';
import MasterData from './pages/MasterData';
import Inventory from './pages/Inventory';
import Branches from './pages/Branches';
import Attendance from './pages/Attendance';
import Logs from './pages/Logs';
import Rooming from './pages/Rooming';

export default function App() {
    return (
        <AuthProvider>
            <ApiProvider>
                <Router>
                    <AppLayout />
                </Router>
            </ApiProvider>
        </AuthProvider>
    );
}

function AppLayout() {
    const { user, loading, login, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Memuat Sistem...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage onLogin={login} />;
    }

    // Logika Logout yang aman untuk WordPress
    const handleLogout = () => {
        // 1. Hapus token di state React
        logout();
        
        // 2. Redirect browser ke URL logout WordPress
        // Ini penting agar sesi di PHP/Backend juga hancur
        window.location.href = '/wp-login.php?action=logout'; 
    };

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/packages', label: 'Paket Umrah', icon: <Package size={20} /> },
        { path: '/jamaah', label: 'Data Jamaah', icon: <Users size={20} /> },
        { path: '/rooming', label: 'Rooming List', icon: <BedDouble size={20} /> },
        { path: '/inventory', label: 'Logistik', icon: <Briefcase size={20} /> },
        { path: '/branches', label: 'Cabang', icon: <Building2 size={20} /> },
        { path: '/attendance', label: 'Presensi', icon: <Clock size={20} /> },
        { path: '/finance', label: 'Keuangan', icon: <Wallet size={20} /> },
        { path: '/hr', label: 'HR & Karyawan', icon: <UserCog size={20} /> },
        { path: '/agents', label: 'Agen & Mitra', icon: <Network size={20} /> },
        { path: '/master', label: 'Master Data', icon: <Settings size={20} /> },
        { path: '/logs', label: 'Activity Logs', icon: <ScrollText size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Area */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="font-bold text-xl text-white">U</span>
                    </div>
                    <div className="leading-tight">
                        <h1 className="font-bold text-lg tracking-wide">UMRAH</h1>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Manager Pro</span>
                    </div>
                </div>
                
                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }
                                `}
                            >
                                <span className={`mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm tracking-wide">{item.label}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-glow"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 bg-gray-950 border-t border-gray-800">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white border-2 border-gray-600">
                            {user.user_display_name ? user.user_display_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">
                                {user.user_display_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user.user_email}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2.5 border border-red-900/30 rounded-lg shadow-sm text-sm font-medium text-red-400 bg-red-900/10 hover:bg-red-600 hover:text-white transition-all duration-200 group"
                    >
                        <LogOut size={16} className="mr-2 group-hover:animate-pulse" />
                        Keluar Sistem
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
                         <span className="font-bold text-gray-800">Umrah Manager</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/packages" element={<Packages />} />
                            <Route path="/jamaah" element={<Jamaah />} />
                            <Route path="/rooming" element={<Rooming />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/branches" element={<Branches />} />
                            <Route path="/attendance" element={<Attendance />} />
                            <Route path="/finance" element={<Finance />} />
                            <Route path="/hr" element={<HR />} />
                            <Route path="/agents" element={<SubAgents />} />
                            <Route path="/master" element={<MasterData />} />
                            <Route path="/logs" element={<Logs />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
}

// Komponen Login Internal (Fallback jika akses langsung via URL tanpa sesi WP)
function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await onLogin(username, password);
        } catch (error) {
            setError('Login Gagal. Periksa username dan password Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl font-bold text-blue-600">U</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Umrah Manager
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Silakan masuk untuk mengakses dashboard
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username / Email</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Username atau Email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                </span>
                            )}
                            {isLoading ? 'Memproses...' : 'Masuk ke Sistem'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}