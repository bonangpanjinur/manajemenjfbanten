import React, { useState } from 'react';
// --- PERBAIKAN: Menambahkan ekstensi .jsx ---
import { useAuth } from './context/AuthContext';
import { useApi } from './context/ApiContext';
import { LoadingScreen, LoadingSpinner } from './components/common/Loading';
import { ErrorMessage } from './components/common/ErrorMessage';
import { Button } from './components/common/FormUI';
import JamaahPaymentsModal from './components/modals/JamaahPaymentsModal';
// --- AKHIR PERBAIKAN ---
import { 
    Briefcase, Home, Package, Users, DollarSign, BarChart2, FileText, LogOut,
    Menu, X
} from 'lucide-react';

// Impor Halaman
// --- PERBAIKAN: Menambahkan ekstensi .jsx ---
import DashboardComponent from './pages/Dashboard';
import PackagesComponent from './pages/Packages';
import JamaahComponent from './pages/Jamaah';
import FinanceComponent from './pages/Finance';
import HRComponent from './pages/HR';
import MarketingComponent from './pages/Marketing';
import LogComponent from './pages/Logs';
// --- AKHIR PERBAIKAN ---

// -- STYLING HELPER (PENGGANTI clsx) --
const clsx = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

const App = () => {
    // State
    const [activePage, setActivePage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modal, setModal] = useState({ type: null, props: {} }); // State untuk modal

    // Contexts
    const { currentUser, adminUrl } = useAuth();
    const { loading, error, refreshData } = useApi(); // Get loading and error

    // Role & Navigation Logic
    const userRole = currentUser?.role || 'subscriber';

    const getNavAccess = (role) => {
        const allNav = {
            dashboard: { name: 'Dashboard', icon: Home, page: 'dashboard' },
            packages: { name: 'Paket', icon: Package, page: 'packages' },
            jamaah: { name: 'Jamaah', icon: Users, page: 'jamaah' },
            finance: { name: 'Keuangan', icon: DollarSign, page: 'finance' },
            hr: { name: 'HR', icon: Briefcase, page: 'hr' },
            marketing: { name: 'Marketing', icon: BarChart2, page: 'marketing' },
            logs: { name: 'Logs', icon: FileText, page: 'logs' },
        };
        
        // Define access based on roles
        const access = {
            administrator: ['dashboard', 'packages', 'jamaah', 'finance', 'hr', 'marketing', 'logs'],
            owner: ['dashboard', 'packages', 'jamaah', 'finance', 'hr', 'marketing', 'logs'],
            admin_staff: ['dashboard', 'packages', 'jamaah', 'marketing'],
            finance_staff: ['dashboard', 'finance', 'jamaah'],
            marketing_staff: ['dashboard', 'marketing', 'jamaah'],
            hr_staff: ['dashboard', 'hr', 'jamaah'],
            subscriber: ['dashboard'], // Default fallback for unknown roles
        };

        const allowedKeys = access[role] || access['subscriber'];
        return allowedKeys.map(key => allNav[key]);
    };

    const navItems = getNavAccess(userRole);

    // Logout URL
    // Hasilkan URL logout WP yang benar
    const logoutUrl = adminUrl ? `${adminUrl.replace(/admin\.php\?page=.*$/, '')}wp-login.php?action=logout` : '#';


    // Render Function
    const renderPage = () => {
        // Pass a function to open modal to child components
        const openModal = (type, props = {}) => setModal({ type, props });

        switch (activePage) {
            case 'dashboard':
                return <DashboardComponent openModal={openModal} />;
            case 'packages':
                return <PackagesComponent openModal={openModal} />;
            case 'jamaah':
                return <JamaahComponent openModal={openModal} />;
            case 'finance':
                return <FinanceComponent openModal={openModal} />;
            case 'hr':
                return <HRComponent openModal={openModal} />;
            case 'marketing':
                return <MarketingComponent openModal={openModal} />;
            case 'logs':
                return <LogComponent openModal={openModal} />;
            default:
                return <DashboardComponent openModal={openModal} />;
        }
    };

    // Render Modal
    const renderModal = () => {
        if (!modal.type) return null;

        const closeModal = () => setModal({ type: null, props: {} });

        switch (modal.type) {
            case 'jamaahPayments':
                return <JamaahPaymentsModal jamaah={modal.props.jamaah} onClose={closeModal} />;
            // TODO: Tambahkan case untuk modal lain (misal: 'packageForm', 'jamaahForm')
            // case 'packageForm':
            //     return <PackageFormModal data={modal.props.data} onClose={closeModal} />;
            default:
                console.warn('Modal type not recognized:', modal.type);
                return null;
        }
    };
    
    // Handle loading and error states
    if (loading && !error) {
        return <LoadingScreen message="Memuat data aplikasi..." />;
    }
    
    if (error) {
        return (
            <ErrorMessage 
                title="Error Aplikasi" 
                message={error}
            >
                <Button onClick={refreshData} disabled={loading}>
                    {loading ? <LoadingSpinner /> : 'Coba Lagi'}
                </Button>
            </ErrorMessage>
        );
    }
    
    // Jika data pengguna belum dimuat
    if (!currentUser) {
         return <LoadingScreen message="Memuat data pengguna..." />;
    }

    // Main JSX Layout
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Modal */}
            {renderModal()}

            {/* Sidebar (Desktop) */}
            <aside className="hidden w-64 flex-shrink-0 flex-col bg-white shadow-lg md:flex">
                <div className="flex h-16 flex-shrink-0 items-center justify-center bg-gray-900 text-white">
                    <Briefcase className="h-8 w-8 text-blue-400" />
                    <span className="ml-2 text-xl font-semibold">Umroh Manager</span>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <a
                            key={item.page}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setActivePage(item.page);
                            }}
                            className={clsx(
                                'flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600',
                                activePage === item.page && 'border-r-4 border-blue-500 bg-blue-50 text-blue-600'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="ml-3">{item.name}</span>
                        </a>
                    ))}
                </nav>
                <div className="border-t p-4">
                    <a
                        href={logoutUrl}
                        className="flex w-full items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-red-100 hover:text-red-700"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="ml-3">Logout</span>
                    </a>
                </div>
            </aside>

            {/* Mobile Sidebar (Overlay) */}
            <div
                className={clsx(
                    'fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden',
                    sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={() => setSidebarOpen(false)}
            ></div>
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:hidden',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-16 items-center justify-between bg-gray-900 px-4 text-white">
                    <div className="flex items-center">
                        <Briefcase className="h-8 w-8 text-blue-400" />
                        <span className="ml-2 text-xl font-semibold">UMH</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="text-gray-300 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto pt-4">
                    {navItems.map((item) => (
                        <a
                            key={item.page}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setActivePage(item.page);
                                setSidebarOpen(false); // Close on select
                            }}
                            className={clsx(
                                'flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600',
                                activePage === item.page && 'border-r-4 border-blue-500 bg-blue-50 text-blue-600'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="ml-3">{item.name}</span>
                        </a>
                    ))}
                </nav>
                 <div className="border-t p-4">
                    <a
                        href={logoutUrl}
                        className="flex w-full items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-red-100 hover:text-red-700"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="ml-3">Logout</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <header className="flex h-16 flex-shrink-0 items-center justify-between bg-white shadow-md md:justify-end">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="px-4 text-gray-500 md:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center pr-4">
                        <span className="text-sm text-gray-600">
                            Selamat datang, <span className="font-medium">{currentUser.full_name}</span>
                        </span>
                        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                            {currentUser.role}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;