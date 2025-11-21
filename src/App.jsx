import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';

// Contexts
import { ApiProvider } from './context/ApiContext';
import { AuthProvider } from './context/AuthContext';

// Components
import Loading from './components/common/Loading';
import ErrorMessage from './components/common/ErrorMessage';

// Pages
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Finance from './pages/Finance';
import Packages from './pages/Packages';
import Inventory from './pages/Inventory';
import HR from './pages/HR';
import Marketing from './pages/Marketing';
import MasterData from './pages/MasterData';
import Logs from './pages/Logs';

/**
 * Komponen Navigasi Atas (Top Menu)
 * Menampilkan tab menu horizontal di atas konten
 */
const TopNavigation = () => {
  const location = useLocation();

  // Daftar Menu untuk Navigasi Atas
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashicons-dashboard' },
    { path: '/jamaah', label: 'Jamaah', icon: 'dashicons-groups' },
    { path: '/packages', label: 'Paket', icon: 'dashicons-tickets-alt' },
    { path: '/finance', label: 'Keuangan', icon: 'dashicons-money' },
    { path: '/inventory', label: 'Inventory', icon: 'dashicons-products' },
    { path: '/hr', label: 'HR & Staff', icon: 'dashicons-businessman' },
    { path: '/marketing', label: 'Marketing', icon: 'dashicons-megaphone' },
    { path: '/settings', label: 'Pengaturan', icon: 'dashicons-admin-settings' },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-0 mb-6 sticky top-0 z-10">
      <div className="flex space-x-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${isActive 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {/* Render icon dashicons jika diperlukan, atau cukup text */}
              <span className={`dashicons ${item.icon} mr-2 text-lg`}></span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Komponen Sinkronisasi: WPSyncRouter
 */
const WPSyncRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.umhSettings && window.umhSettings.currentView) {
      const targetView = window.umhSettings.currentView;
      const routeMap = {
        'dashboard': '/',
        'jamaah': '/jamaah',
        'payments': '/finance',
        'finance': '/finance',
        'packages': '/packages',
        'inventory': '/inventory',
        'hr': '/hr',
        'marketing': '/marketing',
        'settings': '/settings',
        'logs': '/logs'
      };
      const targetPath = routeMap[targetView] || '/';
      
      // Kita hanya force navigate jika User baru masuk (pathname masih root atau berbeda jauh)
      // Ini agar navigasi manual user via TopNav tidak dipaksa balik oleh logic ini
      if (location.pathname === '/' && targetPath !== '/') {
         navigate(targetPath, { replace: true });
      }
    }
  }, []);

  return null;
};

const AppLayout = ({ children }) => {
  return (
    <div className="umh-app min-h-screen bg-gray-50 font-sans">
       {/* Tampilkan Navigasi Atas */}
       <TopNavigation />
       
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ApiProvider>
        <HashRouter>
          <WPSyncRouter />
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jamaah" element={<Jamaah />} />
              <Route path="/jamaah/add" element={<Jamaah />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/settings" element={<MasterData />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="*" element={<div className="p-8 text-center">Halaman tidak ditemukan</div>} />
            </Routes>
          </AppLayout>
        </HashRouter>
      </ApiProvider>
    </AuthProvider>
  );
};

export default App;