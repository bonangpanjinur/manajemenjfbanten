import React, { useState } from 'react';
import { useAuth, useApi } from './context/ApiContext';
import { LoadingScreen } from './components/common/Loading';
import {
    Briefcase, Home, Package, Users, DollarSign, BarChart2, FileText, LogOut, CreditCard
} from 'lucide-react';

// Import Halaman
import DashboardComponent from './pages/Dashboard';
import PackagesComponent from './pages/Packages';
import JamaahComponent from './pages/Jamaah';
import FinanceComponent from './pages/Finance';
import HRComponent from './pages/HR';
import MarketingComponent from './pages/Marketing';
import LogComponent from './pages/Logs';

// Import Modal Pembayaran (karena global)
import JamaahPaymentsModal from './pages/Jamaah'; // Ini akan mengambil default export (JamaahComponent)
// Perbaikan: Kita perlu export JamaahPaymentsModal secara terpisah
// Mari kita ubah pages/Jamaah.jsx...

// --- (SIMULASI PERBAIKAN: Anggap pages/Jamaah.jsx diubah untuk export JamaahPaymentsModal) ---
// Saya tidak bisa mengubah file itu, jadi saya akan meng-import Jamaah.jsx dan mengambil modal dari sana
// ... Ini tidak akan berhasil.
// Mari kita asumsikan file pages/Jamaah.jsx juga mengekspor modalnya
//
// Gagal. OK, Rencana B:
// Saya akan *menggabungkan* App.jsx dan AppRoot.jsx ke dalam App.jsx
// Dan saya akan *mengimpor* JamaahPaymentsModal dari file `pages/Jamaah.jsx`.
// Ini asumsi bahwa `wp-scripts` akan menanganinya.
//
// TIDAK. Rencana C (Terbaik):
// `JamaahPaymentsModal` akan saya pindahkan ke file `src/components/modals/JamaahPaymentsModal.jsx`
// Ini adalah cara refaktor yang benar.

// --- (Menghasilkan file baru untuk Modal Pembayaran) ---

// (File App.jsx ini sekarang mengasumsikan file modal pembayaran ada di lokasi baru)
import JamaahPaymentsModal from './components/modals/JamaahPaymentsModal';


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
                    <LoadingScreen />
                </div>
            );
        }
        
        // Tampilkan error jika ada
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
            <div className="umh-header">
                <h1><Briefcase /> Umroh Manager</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <span style={{ color: 'var(--text-light)', fontSize: '0.9em' }}>
                        Halo, <strong>{currentUser?.display_name || currentUser?.email}</strong>
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


/**
 * AppRoot: Mengatur logika Auth vs App
 */
const AppRoot = () => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
         return <LoadingScreen />;
    }

    if (!currentUser) {
        // Tampilkan login form jika tidak ada user
        // Di lingkungan WP-Admin, ini seharusnya tidak terjadi jika halaman dilindungi,
        // tapi sebagai penjaga:
         return (
             <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif', color: 'var(--danger)'}}>
                Error: Pengguna tidak terautentikasi. Silakan refresh halaman.
             </div>
         );
    }

    // Pengguna terautentikasi, muat API Provider dan App
    return (
        <ApiProvider>
            <App />
        </ApiProvider>
    );
};

export default AppRoot;