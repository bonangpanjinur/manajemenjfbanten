import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Database, Package, Users, DollarSign, 
  Plane, Briefcase, Smartphone, Settings, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS, ROLES } from '../../utils/theme';

// Fallback jika icons belum ada di lucide-react versi lama
const IconMap = ({ name, size = 20, className }) => {
  const icons = {
    Home, Database, Package, Users, DollarSign, 
    Plane, Briefcase, Smartphone, Settings, LogOut
  };
  const Icon = icons[name] || Home;
  return <Icon size={size} className={className} />;
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  // Filter menu berdasarkan role. Jika NAV_ITEMS belum ada di theme, pakai default array
  const safeNavItems = typeof NAV_ITEMS !== 'undefined' ? NAV_ITEMS : [
    { label: "Dashboard", path: "/", icon: "Home", roles: ['owner', 'admin', 'staff', 'branch', 'agent'] },
    { label: "Data Jemaah", path: "/jamaah", icon: "Users", roles: ['owner', 'admin', 'staff', 'branch', 'agent'] },
    // Tambahkan menu basic lainnya sebagai fallback
  ];
  
  const filteredNav = safeNavItems.filter(item => 
    item.roles ? item.roles.includes(user?.role || 'jamaah') : true
  );

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 bg-white border-r border-gray-200 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 shadow-xl flex flex-col`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 px-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-emerald-200 shadow-lg">
              JF
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-amber-500">
              JFBanten
            </span>
          </div>
        </div>

        {/* User Profile Snippet */}
        <div className="p-4 border-b border-gray-50 bg-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || 'Guest'}
              </p>
              <p className="text-xs text-emerald-600 capitalize font-medium">
                {user?.role || 'Pengunjung'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm translate-x-1' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <IconMap name={item.icon} className={({ isActive }) => isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
          >
            <LogOut size={18} />
            <span>Keluar Aplikasi</span>
          </button>
          <p className="mt-3 text-[10px] text-center text-gray-400 uppercase tracking-wider">
            v2.0.0 &copy; 2024 JFBanten
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;