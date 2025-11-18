import React, { useState } from 'react';
// PERBAIKAN: Menghapus ekstensi .jsx agar sesuai build WordPress
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import Dashboard from './pages/Dashboard';
import FinanceComponent from './pages/Finance';
import MarketingComponent from './pages/Marketing';
import HRComponent from './pages/HR';
import JamaahComponent from './pages/Jamaah';
import PackagesComponent from './pages/Packages';
import LogsComponent from './pages/Logs';
// --- PENAMBAHAN: Import Halaman SubAgents ---
import SubAgentsComponent from './pages/SubAgents';
// --- AKHIR PENAMBAHAN ---
import { Modal } from './components/common/Modal';
import { LoadingScreen } from './components/common/Loading';
// AKHIR PERBAIKAN
// --- PENAMBAHAN: Import Ikon FaUserTie ---
import { FaTachometerAlt, FaMoneyBillWave, FaBullhorn, FaUsers, FaUserFriends, FaBoxOpen, FaClipboardList, FaUserTie } from 'react-icons/fa';
// --- AKHIR PENAMBAHAN ---

const App = () => {
    // --- PERBAIKAN (Loading): ---
    // Mengganti { user, loading, login } menjadi { currentUser }
    // Ini adalah perbaikan untuk masalah layar loading yang tidak berhenti
    const { currentUser } = useAuth();
    // --- AKHIR PERBAIKAN (Loading) ---

    const [activePage, setActivePage] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState(null);

    // --- PERBAIKAN (Loading): Menghapus useEffect login() ---
    // useEffect(() => {
    //     ...
    // }, [login]);
    // --- AKHIR PERBAIKAN (Loading) ---

    const openModal = (title, content) => {
        setModalTitle(title);
        setModalContent(
            React.cloneElement(content, {
                // Modifikasi: Mengirim fungsi 'onClose' dan 'onSubmit' ke form
                onClose: () => setIsModalOpen(false),
                onSubmit: (data) => {
                    console.log('Form submitted', data);
                    setIsModalOpen(false);
                }
            })
        );
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalTitle('');
        setModalContent(null);
    };

    // --- PERBAIKAN (Loading): ---
    // Mengganti kondisi loading dari (loading || !user) menjadi (!currentUser)
    if (!currentUser) {
        return <LoadingScreen />;
    }
    // --- AKHIR PERBAIKAN (Loading) ---

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="mr-3" />, roles: ['admin', 'finance', 'marketing', 'hr', 'jamaah', 'owner', 'super_admin', 'administrator'] },
        { id: 'finance', label: 'Finance', icon: <FaMoneyBillWave className="mr-3" />, roles: ['admin', 'finance', 'owner', 'super_admin', 'administrator', 'admin_staff', 'finance_staff'] },
        { id: 'marketing', label: 'Marketing', icon: <FaBullhorn className="mr-3" />, roles: ['admin', 'marketing', 'owner', 'super_admin', 'administrator', 'admin_staff', 'marketing_staff'] },
        // --- PENAMBAHAN: Nav Item Sub Agen ---
        { id: 'sub_agents', label: 'Sub Agen', icon: <FaUserTie className="mr-3" />, roles: ['admin', 'marketing', 'owner', 'super_admin', 'administrator', 'admin_staff', 'marketing_staff'] },
        // --- AKHIR PENAMBAHAN ---
        { id: 'hr', label: 'HR', icon: <FaUsers className="mr-3" />, roles: ['admin', 'hr', 'owner', 'super_admin', 'administrator', 'admin_staff', 'hr_staff'] },
        { id: 'jamaah', label: 'Jamaah', icon: <FaUserFriends className="mr-3" />, roles: ['admin', 'jamaah', 'marketing', 'finance', 'owner', 'super_admin', 'administrator', 'admin_staff', 'finance_staff', 'marketing_staff'] },
        { id: 'packages', label: 'Packages', icon: <FaBoxOpen className="mr-3" />, roles: ['admin', 'marketing', 'owner', 'super_admin', 'administrator', 'admin_staff', 'marketing_staff'] },
        { id: 'logs', label: 'Logs', icon: <FaClipboardList className="mr-3" />, roles: ['admin', 'owner', 'super_admin', 'administrator', 'admin_staff'] },
    ];

    // --- PERBAIKAN (Loading): ---
    // Mengganti 'user.role' menjadi 'currentUser.role' dan menambah cek role
    const allowedNavItems = navItems.filter(item => 
        item.roles.includes(currentUser.role)
    );
    // --- AKHIR PERBAIKAN (Loading) ---

    return (
        <ApiProvider>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <aside className="w-64 bg-white text-gray-800 p-4 shadow-lg overflow-y-auto">
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
                    {/* Top Bar */}
                    <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
                        <h2 className="text-xl font-semibold text-gray-700 capitalize">{activePage.replace('_', ' ')}</h2>
                        <div className="text-right">
                            {/* --- PERBAIKAN (Loading): --- */}
                            {/* Mengganti 'user.display_name' menjadi 'currentUser.full_name' */}
                            <span className="font-medium text-gray-800">{currentUser.full_name}</span>
                            <span className="ml-2 text-sm text-gray-500 capitalize">({currentUser.role})</span>
                            {/* --- AKHIR PERBAIKAN (Loading) --- */}
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="p-6">
                        {/* PERBAIKAN: Mengirim 'openModal' ke setiap komponen halaman. */}
                        {activePage === 'dashboard' && <Dashboard openModal={openModal} />}
                        {activePage === 'finance' && <FinanceComponent openModal={openModal} />}
                        {activePage === 'marketing' && <MarketingComponent openModal={openModal} />}
                        {/* --- PENAMBAHAN: Tampilkan Komponen SubAgents --- */}
                        {activePage === 'sub_agents' && <SubAgentsComponent openModal={openModal} />}
                        {/* --- AKHIR PENAMBAHAN --- */}
                        {activePage === 'hr' && <HRComponent openModal={openModal} />}
                        {activePage === 'jamaah' && <JamaahComponent openModal={openModal} />}
                        {activePage === 'packages' && <PackagesComponent openModal={openModal} />}
                        {activePage === 'logs' && <LogsComponent />}
                    </div>
                </main>

                {/* Global Modal */}
                {isModalOpen && (
                    <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
                        {/* PERBAIKAN: Mengganti 'closeModal' dengan 'onClose' */}
                        {modalContent && React.cloneElement(modalContent, {
                            onClose: closeModal,
                            onSubmit: () => {
                                // Aksi submit default, form akan menangani API call
                                closeModal();
                            }
                        })}
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