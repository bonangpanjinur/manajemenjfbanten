import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm/50 backdrop-blur-md bg-white/90">
      <div className="px-4 h-16 flex items-center justify-between lg:justify-end gap-4">
        
        {/* Mobile Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Menu size={24} />
        </button>

        {/* Desktop Search Bar (Optional) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
            placeholder="Cari data jemaah, invoice, atau manifest..."
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          {/* User Info (Visible on Desktop) */}
          <div className="hidden sm:flex flex-col items-end mr-2">
             <span className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</span>
             <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;