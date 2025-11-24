import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';

// Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import TransactionForm from './components/forms/TransactionForm'; // Contoh form
import Finance from './pages/Finance';
import Inventory from './pages/Inventory';
import Manifest from './pages/Manifest';
import Rooming from './pages/Rooming';
import HR from './pages/HR';
import Branches from './pages/Branches';
import AgentDashboard from './pages/AgentDashboard';
import Marketing from './pages/Marketing';
import MasterData from './pages/MasterData';
import Logs from './pages/Logs';
import Login from './pages/Login'; // Jika ada login internal

const App = () => {
  // Mendapatkan path dasar jika diperlukan, tapi HashRouter mengabaikannya
  // const basename = '/wp-admin/admin.php?page=umroh-manager-hybrid'; 

  return (
    <AuthProvider>
      <ApiProvider>
        {/* PENTING: Gunakan HashRouter untuk plugin WordPress agar tidak konflik dengan URL Admin */}
        <Router>
          <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
            {/* Sidebar Tetap */}
            <div className="flex-shrink-0 h-full">
                <Sidebar />
            </div>

            {/* Konten Utama */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <Navbar />
              
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                <Routes>
                  {/* Redirect root hash #/ ke dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/jamaah" element={<Jamaah />} />
                  <Route path="/packages" element={<Packages />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/manifest" element={<Manifest />} />
                  <Route path="/rooming" element={<Rooming />} />
                  <Route path="/hr" element={<HR />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/marketing" element={<Marketing />} />
                  <Route path="/master-data" element={<MasterData />} />
                  <Route path="/logs" element={<Logs />} />
                  
                  {/* Route Khusus Agent */}
                  <Route path="/agent-dashboard" element={<AgentDashboard />} />

                  {/* Fallback jika route tidak ditemukan */}
                  <Route path="*" element={
                    <div className="text-center mt-10">
                        <h2 className="text-2xl font-bold text-gray-700">Halaman tidak ditemukan</h2>
                        <p className="text-gray-500">Route URL tidak cocok.</p>
                    </div>
                  } />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </ApiProvider>
    </AuthProvider>
  );
};

export default App;