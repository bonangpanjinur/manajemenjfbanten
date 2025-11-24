import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Library notifikasi
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/common/ProtectedRoute';

// Eager Loading untuk halaman Login agar muncul instan
import Login from './pages/Login';

// Lazy Loading Pages (Performance Optimization)
// Webpack akan memecah file-file ini menjadi chunk terpisah
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AgentDashboardPage = lazy(() => import('./pages/dashboard/AgentDashboard'));
const Jamaah = lazy(() => import('./pages/Jamaah'));
const Packages = lazy(() => import('./pages/Packages'));
const TransactionForm = lazy(() => import('./components/forms/TransactionForm'));
const Finance = lazy(() => import('./pages/Finance'));
const MasterData = lazy(() => import('./pages/MasterData'));
const Branches = lazy(() => import('./pages/Branches'));
const SubAgents = lazy(() => import('./pages/SubAgents'));
const Marketing = lazy(() => import('./pages/Marketing'));
const Inventory = lazy(() => import('./pages/Inventory'));
const HR = lazy(() => import('./pages/HR'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Manifest = lazy(() => import('./pages/Manifest'));
const Rooming = lazy(() => import('./pages/Rooming'));
const ItineraryBuilder = lazy(() => import('./pages/ItineraryBuilder'));
const Logs = lazy(() => import('./pages/Logs'));
const Portal = lazy(() => import('./pages/jamaah/Portal'));

// Komponen Error Boundary untuk menangani kegagalan lazy loading
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Lazy loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <h3 className="text-lg font-medium text-gray-900">Gagal memuat halaman</h3>
          <p className="text-sm text-gray-500 mb-4">Terjadi kesalahan koneksi atau file tidak ditemukan. Silakan muat ulang.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Layout Wrapper Component
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Jika user berada di halaman portal jamaah, jangan tampilkan layout admin
  if (user?.role === 'jamaah') {
      return (
          <div className="min-h-screen bg-gray-50">
               <ErrorBoundary>
                    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loading /></div>}>
                        {children}
                    </Suspense>
               </ErrorBoundary>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar 
        user={user} 
        onMenuClick={() => setSidebarOpen(true)} 
        onLogout={logout}
      />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          userRole={user?.role}
        />
        
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:ml-64 transition-all duration-200">
            {/* Suspense dan ErrorBoundary untuk menangani loading chunk */}
            <ErrorBoundary>
                <Suspense fallback={<div className="flex justify-center items-center h-64"><Loading /></div>}>
                    {children}
                </Suspense>
            </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading fullScreen />;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      
      {/* Route Khusus Portal Jamaah */}
       <Route 
        path="/portal" 
        element={
          <ProtectedRoute allowedRoles={['jamaah']}>
            <Layout>
              <Portal />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Admin & Agent Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Dashboard Utama */}
                <Route path="/" element={
                    user?.role === 'agent' ? <AgentDashboardPage /> : <Dashboard />
                } />
                
                {/* Jamaah Management */}
                <Route path="/jamaah" element={<Jamaah />} />
                <Route path="/jamaah/add" element={<TransactionForm />} />
                <Route path="/jamaah/edit/:id" element={<TransactionForm />} />
                
                {/* Packages */}
                <Route path="/packages" element={<Packages />} />
                
                {/* Finance */}
                <Route path="/finance" element={<Finance />} />
                
                {/* Master Data */}
                <Route path="/master-data" element={<MasterData />} />

                {/* Branches & Agents */}
                <Route path="/branches" element={<Branches />} />
                <Route path="/sub-agents" element={<SubAgents />} />

                {/* Marketing */}
                <Route path="/marketing" element={<Marketing />} />

                {/* Operations */}
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/manifest" element={<Manifest />} />
                <Route path="/rooming" element={<Rooming />} />
                <Route path="/itinerary" element={<ItineraryBuilder />} />

                {/* HR & Attendance */}
                <Route path="/hr" element={<HR />} />
                <Route path="/attendance" element={<Attendance />} />

                {/* System Logs */}
                <Route path="/logs" element={<Logs />} />
                
                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ApiProvider>
      <AuthProvider>
        {/* Toaster Global untuk Notifikasi */}
        <Toaster 
            position="top-right" 
            toastOptions={{ 
                duration: 4000,
                style: {
                    background: '#363636',
                    color: '#fff',
                },
                success: {
                    style: {
                        background: '#10B981', // Emerald 500
                    },
                },
                error: {
                    style: {
                        background: '#EF4444', // Red 500
                    },
                },
            }} 
        />
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ApiProvider>
  );
};

export default App;