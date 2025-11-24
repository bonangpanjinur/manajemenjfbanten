import React from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import { Users, DollarSign, Plane, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { ROLES } from '../utils/theme';
import AgentDashboard from './dashboard/AgentDashboard'; // Pastikan file ini ada atau buat dummy
import Portal from './jamaah/Portal';

const Dashboard = () => {
  const { user } = useAuth();
  
  // 1. Jika Role adalah Jemaah, tampilkan Portal khusus (Tampilan Mobile App)
  if (user?.role === ROLES.JAMAAH) {
    return <Portal />;
  }

  // 2. Jika Role adalah Agen, tampilkan Dashboard Agen
  if (user?.role === ROLES.AGENT) {
    return <AgentDashboard />;
  }

  // 3. Dashboard untuk Owner, Admin, Cabang, Staff
  // Data dummy untuk visualisasi (nanti diganti fetch API)
  const stats = [
    { label: "Total Jemaah Aktif", value: "1,240", icon: Users, color: "emerald", trend: "+12%" },
    { label: "Pendapatan Bulan Ini", value: "Rp 4.2M", icon: DollarSign, color: "amber", trend: "+8%" },
    { label: "Keberangkatan Next", value: "15 Okt", icon: Plane, color: "blue", sub: "45 Pax" },
    { label: "Sisa Kuota Paket", value: "12", icon: AlertCircle, color: "red", sub: "Paket Hemat" },
  ];

  // Filter stats based on role (Misal Staff tidak liat uang)
  const visibleStats = user?.role === ROLES.STAFF 
    ? stats.filter(s => s.icon !== DollarSign) 
    : stats;

  return (
    <div className="p-6 space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Assalamu'alaikum, {user?.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Berikut ringkasan operasional travel hari ini.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-emerald-200 transition-all text-sm font-medium flex items-center gap-2">
            <Users size={16} /> Daftar Jemaah Baru
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity bg-${stat.color}-500 rounded-bl-3xl`}>
               <stat.icon size={40} />
            </div>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              </div>
            </div>
            {(stat.trend || stat.sub) && (
              <div className="mt-4 flex items-center text-sm">
                {stat.trend ? (
                  <span className="text-emerald-600 flex items-center font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp size={14} className="mr-1" /> {stat.trend}
                  </span>
                ) : (
                  <span className="text-gray-400">{stat.sub}</span>
                )}
                <span className="ml-2 text-gray-400 text-xs">vs bulan lalu</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Activity / Jemaah */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Pendaftaran Jemaah Terbaru</h3>
            <button className="text-sm text-emerald-600 font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Nama Jemaah</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3">Cabang/Agen</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      Abdullah Bin Fulan
                      <div className="text-xs text-gray-400 font-normal">REG-202400{item}</div>
                    </td>
                    <td className="px-4 py-3">Umrah Ramadhan (Quad)</td>
                    <td className="px-4 py-3">Cabang Serang</td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs font-semibold">
                        Menunggu DP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Tasks / Reminders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Tugas Pending</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle size={20} className="text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 text-sm">Visa Expired</h4>
                <p className="text-xs text-red-600 mt-1">3 Paspor jemaah expired bulan depan. Segera hubungi.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <CheckCircle size={20} className="text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 text-sm">Manifest Final</h4>
                <p className="text-xs text-blue-600 mt-1">Finalisasi manifest keberangkatan tgl 15.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;