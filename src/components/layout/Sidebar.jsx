import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAssetUrl } from '../../utils/helpers';

const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Helper untuk mengecek menu aktif
    const isActive = (path) => currentPath === path;

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashicons-dashboard' },
        { path: '/jamaah', label: 'Data Jamaah', icon: 'dashicons-groups' },
        { path: '/packages', label: 'Paket Umroh', icon: 'dashicons-tickets-alt' },
        { path: '/finance', label: 'Keuangan', icon: 'dashicons-money-alt' },
        { path: '/inventory', label: 'Inventaris', icon: 'dashicons-products' },
        { path: '/manifest', label: 'Manifest', icon: 'dashicons-clipboard' },
        { path: '/rooming', label: 'Rooming', icon: 'dashicons-building' },
        { path: '/hr', label: 'HRD', icon: 'dashicons-businessperson' },
        { path: '/branches', label: 'Cabang', icon: 'dashicons-networking' },
        { path: '/marketing', label: 'Marketing', icon: 'dashicons-megaphone' },
        { path: '/agent-dashboard', label: 'Agen', icon: 'dashicons-admin-users' },
        { path: '/master-data', label: 'Master Data', icon: 'dashicons-database' },
        { path: '/logs', label: 'Logs', icon: 'dashicons-list-view' },
    ];

    return (
        <div className="bg-white w-64 h-full shadow-lg flex flex-col border-r border-gray-200">
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-center border-b border-gray-100">
                {/* Menggunakan getAssetUrl agar gambar tidak broken di WP Admin */}
                <img 
                    src={getAssetUrl('images/logo.png')} 
                    alt="Logo Travel" 
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.style.display = 'none'; // Sembunyikan jika gambar gagal load
                        e.target.nextSibling.style.display = 'block'; // Tampilkan teks alternatif
                    }}
                />
                <span className="text-xl font-bold text-teal-600 hidden ml-2">JF Banten</span>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                            isActive(item.path)
                                ? 'bg-teal-50 text-teal-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        {/* Render Dashicon WordPress */}
                        <span className={`dashicons ${item.icon} mr-3 text-lg ${
                            isActive(item.path) ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`}></span>
                        
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Admin User</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;