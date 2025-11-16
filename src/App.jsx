import React, { useState } from 'react';
import { useAuth } from './context/AuthContext'; // .jsx dihapus
import { useApi } from './context/ApiContext'; // .jsx dihapus
import { LoadingScreen, LoadingSpinner } from './components/common/Loading'; // .jsx dihapus
import { ErrorMessage } from './components/common/ErrorMessage'; // .jsx dihapus
import { Button } from './components/common/FormUI'; // .jsx dihapus
import JamaahPaymentsModal from './components/modals/JamaahPaymentsModal'; // .jsx dihapus
import { 
    Briefcase, Home, Package, Users, DollarSign, BarChart2, FileText, LogOut
} from 'lucide-react';

// Impor Halaman
import DashboardComponent from './pages/Dashboard'; // .jsx dihapus
import PackagesComponent from './pages/Packages'; // .jsx dihapus
import JamaahComponent from './pages/Jamaah'; // .jsx dihapus
import FinanceComponent from './pages/Finance'; // .jsx dihapus
import HRComponent from './pages/HR'; // .jsx dihapus
import MarketingComponent from './pages/Marketing'; // .jsx dihapus
import LogComponent from './pages/Logs'; // .jsx dihapus

// -- STYLING HELPER (PENGGANTI clsx) --
const cn = (...classes) => classes.filter(Boolean).join(' ');

const App = () => {
    const { currentUser, logout, isLoading: authLoading } = useAuth();
    const { loading: apiLoading, error: apiError } = useApi();
    const [activeView, setActiveView] = useState('dashboard');
    
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

    // Menampilkan loading screen penuh saat auth pertama kali dimuat
    if (authLoading) {
        return <LoadingScreen />;
    }

    // (TODO: Tampilkan halaman login jika !currentUser dan bukan di wp-admin)
    // if (!currentUser) {
    //     return <LoginPage />;
    // }
    
    const renderView = () => {
        // Tampilkan loading spinner jika API sedang memuat data awal
        if (apiLoading) {
            return (
                <div className="bg-white shadow-lg rounded-lg p-6 relative min-h-[300px]">
                    <LoadingSpinner />
                </div>
            );
        }
        
        // Tampilkan error jika ada
        if (apiError) {
             return (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <ErrorMessage message={`Gagal memuat data: ${apiError}`} />
                </div>
            );
        }
        
        // Tampilkan halaman yang aktif
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
            className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100',
                activeView === view && 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
            )}
            onClick={() => setActiveView(view)}
        >
            {icon} {label}
        </button>
    );
    
    return (
        <div className="p-4 md:p-6 lg:p-8">
            <header className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-white shadow-md rounded-lg gap-4">
                <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
                    <Briefcase /> 
                    <span>Jannah Firdaus - Umroh Manager</span>
                </h1>
                <div className="flex items-center gap-4">
                     <span className="text-sm text-gray-600 hidden md:block">
                        Halo, <strong>{currentUser?.full_name || currentUser?.email}</strong>
                     </span>
                    <Button variant="secondary" size="md" onClick={logout}>
                        <LogOut size={16} /> Logout
                    </Button>
                </div>
            </header>

            <nav className="flex flex-wrap gap-2 mb-6">
                <NavButton view="dashboard" icon={<Home size={16} />} label="Dashboard" />
                <NavButton view="packages" icon={<Package size={16} />} label="Paket" />
                <NavButton view="jamaah" icon={<Users size={16} />} label="Jemaah" />
                <NavButton view="finance" icon={<DollarSign size={16} />} label="Keuangan" />
                <NavButton view="hr" icon={<Briefcase size={16} />} label="HR" />
                <NavButton view="marketing" icon={<BarChart2 size={16} />} label="Marketing" />
                <NavButton view="logs" icon={<FileText size={16} />} label="Logs" />
            </nav>

            {/* Konten Halaman */}
            <main>
                {renderView()}
            </main>
            
            {/* Modal Pembayaran (Global) */}
            <JamaahPaymentsModal
                isOpen={isPaymentModalOpen}
                onClose={handleClosePayments}
                jamaah={selectedJamaahForPayments}
            />
        </div>
    );
};

export default App;