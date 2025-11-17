import React, { useState, useEffect } from 'react';
// PERBAIKAN: Menghapus ekstensi .jsx dari path impor
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import Dashboard from './pages/Dashboard';
import FinanceComponent from './pages/Finance';
import MarketingComponent from './pages/Marketing';
import HRComponent from './pages/HR';
import JamaahComponent from './pages/Jamaah';
import PackagesComponent from './pages/Packages';
import LogsComponent from './pages/Logs';
import { Modal } from './components/common/Modal';
import { LoadingScreen } from './components/common/Loading';
import { FaTachometerAlt, FaMoneyBillWave, FaBullhorn, FaUsers, FaUserFriends, FaBoxOpen, FaClipboardList } from 'react-icons/fa';

const App = () => {
    const { user, loading, login } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState(null);

    useEffect(() => {
        // Cek kredensial dari global var (diset oleh PHP)
        if (window.umhGlobal && window.umhGlobal.username && window.umhGlobal.password) {
            login(window.umhGlobal.username, window.umhGlobal.password);
        }
    }, [login]);

    const openModal = (title, content) => {
        setModalTitle(title);
        setModalContent(
            React.cloneElement(content, {
                closeModal: () => setIsModalOpen(false)
            })
        );
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalTitle('');
        setModalContent(null);
    };

    if (loading || !user) {
        return <LoadingScreen />;
    }

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="mr-3" />, roles: ['admin', 'finance', 'marketing', 'hr', 'jamaah'] },
        { id: 'finance', label: 'Finance', icon: <FaMoneyBillWave className="mr-3" />, roles: ['admin', 'finance'] },
        { id: 'marketing', label: 'Marketing', icon: <FaBullhorn className="mr-3" />, roles: ['admin', 'marketing'] },
        { id: 'hr', label: 'HR', icon: <FaUsers className="mr-3" />, roles: ['admin', 'hr'] },
        { id: 'jamaah', label: 'Jamaah', icon: <FaUserFriends className="mr-3" />, roles: ['admin', 'jamaah', 'marketing', 'finance'] },
        { id: 'packages', label: 'Packages', icon: <FaBoxOpen className="mr-3" />, roles: ['admin', 'marketing'] },
        { id: 'logs', label: 'Logs', icon: <FaClipboardList className="mr-3" />, roles: ['admin'] },
    ];

    const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

    return (
        <ApiProvider>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <aside className="w-64 bg-white text-gray-800 p-4 shadow-lg">
                    <h1 className="text-2xl font-bold mb-6 text-indigo-600">Manajemen Umroh</h1>
                    <nav>
                        <ul>
                            {allowedNavItems.map(item => (
                                <li key={item.id} className="mb-2">
                                    <button
                                        onClick={() => setActivePage(item.id)}
                                        className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition-all duration-200 ${activePage === item.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Top Bar (Jika Diperlukan) */}
                    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-700 capitalize">{activePage}</h2>
                        <div className="text-right">
                            <span className="font-medium text-gray-800">{user.display_name}</span>
                            <span className="ml-2 text-sm text-gray-500 capitalize">({user.role})</span>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="p-6">
                        {activePage === 'dashboard' && <Dashboard />}
                        {activePage === 'finance' && <FinanceComponent openModal={openModal} />}
                        {activePage === 'marketing' && <MarketingComponent openModal={openModal} />}
                        {activePage === 'hr' && <HRComponent openModal={openModal} />}
                        {activePage === 'jamaah' && <JamaahComponent openModal={openModal} />}
                        {activePage === 'packages' && <PackagesComponent openModal={openModal} />}
                        {activePage === 'logs' && <LogsComponent />}
                    </div>
                </main>

                {/* Global Modal */}
                {isModalOpen && (
                    <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
                        {modalContent}
                    </Modal>
                )}
            </div>
        </ApiProvider>
    );
};

// Wrapper App dengan AuthProvider
const AppWithAuth = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default AppWithAuth;