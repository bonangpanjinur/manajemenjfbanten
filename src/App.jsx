import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import MasterData from './pages/MasterData';
import Finance from './pages/Finance';
import Manifest from './pages/Manifest';
import SubAgents from './pages/SubAgents';
import AgentDashboard from './pages/dashboard/AgentDashboard';
import Portal from './pages/jamaah/Portal';
import Rooming from './pages/Rooming';
import Inventory from './pages/Inventory';
import HR from './pages/HR';
import Logs from './pages/Logs';

// Helper untuk Layout Utama (Sidebar + Navbar + Content)
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Jika user adalah Jemaah, tampilkan layout khusus mobile/portal
  if (user?.role === 'jamaah') {
    return (
      <Routes>
        <Route path="/portal" element={<Portal />} />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Modul Operasional */}
        <Route path="/jamaah" element={<ProtectedRoute><Jamaah /></ProtectedRoute>} />
        <Route path="/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
        <Route path="/manifest" element={<ProtectedRoute><Manifest /></ProtectedRoute>} />
        <Route path="/rooming" element={<ProtectedRoute><Rooming /></ProtectedRoute>} />
        
        {/* Modul Bisnis */}
        <Route path="/finance" element={<ProtectedRoute roles={['owner','admin','finance']}><Finance /></ProtectedRoute>} />
        <Route path="/sub-agents" element={<ProtectedRoute roles={['owner','admin','branch']}><SubAgents /></ProtectedRoute>} />
        
        {/* Modul Manajemen */}
        <Route path="/inventory" element={<ProtectedRoute roles={['owner','admin','logistik']}><Inventory /></ProtectedRoute>} />
        <Route path="/hr" element={<ProtectedRoute roles={['owner','hr']}><HR /></ProtectedRoute>} />
        <Route path="/master-data" element={<ProtectedRoute roles={['owner','admin']}><MasterData /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute roles={['owner','admin']}><Logs /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ApiProvider>
            <AppRoutes />
        </ApiProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;