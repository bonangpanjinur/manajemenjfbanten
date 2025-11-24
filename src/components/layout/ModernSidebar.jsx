import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Database, Package, Users, DollarSign, 
  Plane, Briefcase, Smartphone, Settings, LogOut 
} from 'lucide-react'; // Pastikan install lucide-react
import { NAV_ITEMS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

// Icon mapper helper
const IconMap = ({ name, size = 20, className }) => {
  const icons = {
    Home, Database, Package, Users, DollarSign, 
    Plane, Briefcase, Smartphone, Settings, LogOut
  };
  const Icon = icons[name] || Home;
  return <Icon size={size} className={className} />;
};

const ModernSidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  
  // Filter menu berdasarkan role user yang sedang login
  const filteredNav = NAV_ITEMS.filter(item => 
    item.roles.includes(user?.role || 'jamaah')
  );

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-200 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 w-64 shadow-xl flex flex-col`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg">
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
          <img 
            src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.name} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || 'Guest'}
            </p>
            <p className="text-xs text-emerald-600 capitalize">
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
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm translate-x-1' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <IconMap name={item.icon} className={({ isActive }) => isActive ? 'text-emerald-600' : 'text-gray-400'} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Keluar Aplikasi
        </button>
        <p className="mt-4 text-xs text-center text-gray-400">
          v2.0.0 &copy; 2024 JFBanten
        </p>
      </div>
    </aside>
  );
};

export default ModernSidebar;