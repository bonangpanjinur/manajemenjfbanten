import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import { ROLES } from './utils/permissions';

// Components
import Sidebar from './components/layout/Sidebar'; // Pastikan file ini ada atau sesuaikan
import Navbar from './components/layout/Navbar';   // Pastikan file ini ada atau sesuaikan
import Loading from './components/common/Loading';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Finance from './pages/Finance';
import Manifest from './pages/Manifest';
import HR from './pages/HR';
import Inventory from './pages/Inventory';
import MasterData from './pages/MasterData';
import Marketing from './pages/Marketing';
import Branches from './pages/Branches';
import SubAgents from './pages/SubAgents';
import Rooming from './pages/Rooming';
import Attendance from './pages/Attendance';
import Logs from './pages/Logs';

// Portal Khusus
import JamaahPortal from './pages/jamaah/Portal';

// Layout Admin (Sidebar + Navbar)
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* --- ZONE 1: OWNER & SUPER ADMIN (Full Access) --- */}
      <Route path="/" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.STAFF, ROLES.BRANCH, ROLES.AGENT]}>
          <AdminLayout><Dashboard /></AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/master-data" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
          <AdminLayout><MasterData /></AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/branches" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
          <AdminLayout><Branches /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* --- ZONE 2: FINANCE & TRANSAKSI --- */}
      {/* Diakses oleh: Owner, Finance Pusat, Admin Cabang */}
      <Route path="/finance" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.BRANCH]}>
          <AdminLayout><Finance /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* --- ZONE 3: OPERASIONAL (Jamaah, Manifest, Rooming) --- */}
      {/* Diakses oleh: Hampir semua internal kecuali Jemaah */}
      <Route path="/jamaah" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.STAFF, ROLES.BRANCH, ROLES.AGENT]}>
          <AdminLayout><Jamaah /></AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/manifest" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.STAFF, ROLES.BRANCH]}>
          <AdminLayout><Manifest /></AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/rooming" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.STAFF]}>
          <AdminLayout><Rooming /></AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.STAFF, ROLES.BRANCH]}>
          <AdminLayout><Inventory /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* --- ZONE 4: MARKETING & AGEN --- */}
      <Route path="/marketing" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.STAFF]}>
          <AdminLayout><Marketing /></AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/sub-agents" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.BRANCH]}>
          <AdminLayout><SubAgents /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* --- ZONE 5: HRD --- */}
      <Route path="/hr" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
          <AdminLayout><HR /></AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/attendance" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.STAFF]}>
          <AdminLayout><Attendance /></AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/packages" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.STAFF]}>
          <AdminLayout><Packages /></AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/logs" element={
        <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
          <AdminLayout><Logs /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* --- ZONE 6: PORTAL JEMAAH (Tampilan Khusus) --- */}
      <Route path="/portal" element={
        <ProtectedRoute allowedRoles={[ROLES.JAMAAH]}>
          <JamaahPortal />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ApiProvider>
        <AppRoutes />
      </ApiProvider>
    </AuthProvider>
  );
};

export default App;