import React, { useState } from 'react';
// PERBAIKAN: Import hook dari file context yang benar
import { useAuth } from './context/AuthContext.jsx';
import { useApi } from './context/ApiContext.jsx';
import { LoadingScreen, LoadingSpinner } from './components/common/Loading.jsx'; // LoadingSpinner juga di-import
import { ErrorMessage } from './components/common/ErrorMessage.jsx'; // Import ErrorMessage
import {
    Briefcase, Home, Package, Users, DollarSign, BarChart2, FileText, LogOut
} from 'lucide-react';

// Import Halaman
import DashboardComponent from './pages/Dashboard.jsx';
import PackagesComponent from './pages/Packages.jsx';
import JamaahComponent from './pages/Jamaah.jsx';
import FinanceComponent from './pages/Finance.jsx';
import HRComponent from './pages/HR.jsx';
import MarketingComponent from './pages/Marketing.jsx';
import LogComponent from './pages/Logs.jsx';

// PERBAIKAN: Import modal dari lokasi komponen yang sudah dipisah
import JamaahPaymentsModal from './components/modals/JamaahPaymentsModal.jsx';
// PERBAIKAN: Import style.js
import { styles } from './style.js';


/**
 * Komponen App Utama (Layout dan Navigasi)
 */
const App = () => {
    const { currentUser, logout } = useAuth();
    const { loading: apiLoading, error: apiError } = useApi(); // Ambil loading & error dari API
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
    
    const renderView = () => {
        // Tampilkan loading spinner jika API sedang memuat data awal
        if (apiLoading) {
            return (
                <div className="umh-component-container">
                    {/* PERBAIKAN: Gunakan LoadingSpinner, bukan LoadingScreen penuh */}
                    <LoadingSpinner />
                </div>
            );
        }
        
        // PERBAIKAN: Tampilkan error jika ada
        if (apiError) {
             return (
                <div className="umh-component-container">
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
            className={`umh-nav-button ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)}
        >
            {icon} {label}
        </button>
    );
    
    // (Izin akses bisa ditambahkan di sini jika diperlukan)
    // const canAccess = (module) => { ... };

    return (
        <>
            {/* PERBAIKAN: Render style di sini */}
            <style>{styles}</style>
            
            <div className="umh-header">
                <h1><Briefcase /> Umroh Manager</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <span style={{ color: 'var(--text-light)', fontSize: '0.9em' }}>
                        {/* PERBAIKAN: Gunakan full_name sesuai data dari api-users.php */}
                        Halo, <strong>{currentUser?.full_name || currentUser?.email}</strong>
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
            />
        </>
    );
};

// PERBAIKAN: Hapus AppRoot, file ini hanya export App
export default App;