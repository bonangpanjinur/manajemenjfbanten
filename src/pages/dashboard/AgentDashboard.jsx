import React, { useEffect, useState } from 'react';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';
import { FaUserPlus, FaUsers, FaMoneyBillWave, FaQrcode } from 'react-icons/fa';

const AgentDashboard = () => {
  const { user } = useAuth();
  const { get } = useApi();
  
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch Stats
        const statsRes = await get('/agent/dashboard-stats'); 
        if (statsRes.success) {
          setStats(statsRes.data);
        }

        // Fetch Leads
        const leadsRes = await get('/agent/recent-leads');
        if (leadsRes.success) {
          setRecentLeads(leadsRes.data);
        }

      } catch (err) {
        console.error("Agent Dashboard Error:", err);
        setError("Gagal memuat data dashboard. Pastikan anda terhubung ke server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [get]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Selamat Datang, {user?.name || 'Partner'}!</h1>
          <p className="opacity-90 text-blue-100">Pantau performa dan komisi anda hari ini.</p>
          
          <div className="mt-6 flex flex-wrap gap-3">
             <button className="bg-white text-blue-700 px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow hover:bg-gray-100 transition transform hover:-translate-y-0.5">
                <FaUserPlus /> Input Jemaah Baru
             </button>
             <button className="bg-blue-900 bg-opacity-40 text-white border border-white border-opacity-30 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-opacity-60 transition backdrop-blur-sm">
                <FaQrcode /> Link Referral
             </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute top-10 right-20 w-20 h-20 bg-blue-400 opacity-20 rounded-full blur-xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Jemaah Closing" 
          value={stats?.totalJamaah || 0} 
          icon={<FaUsers />} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Komisi Pending" 
          value={formatIDR(stats?.komisiPending)} 
          icon={<FaMoneyBillWave />} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Komisi Cair" 
          value={formatIDR(stats?.komisiCair)} 
          icon={<FaMoneyBillWave />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Prospek Baru" 
          value={stats?.potensiLeads || 0} 
          icon={<FaUserPlus />} 
          color="bg-purple-500" 
        />
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-gray-800 text-lg">Jemaah Terbaru Anda</h3>
           <button className="text-blue-600 text-sm font-medium hover:underline">Lihat Semua</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 pl-2">Nama Jemaah</th>
                <th className="pb-3">Paket</th>
                <th className="pb-3">Tanggal Input</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <tr key={lead.id} className="text-sm text-gray-700 hover:bg-gray-50 transition">
                    <td className="py-3 pl-2 font-medium text-gray-900">{lead.name}</td>
                    <td className="py-3">{lead.paket_name || <span className="text-gray-400 italic">Belum pilih paket</span>}</td>
                    <td className="py-3 text-gray-500">{new Date(lead.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block
                        ${['paid', 'booked', 'departed'].includes(lead.status) ? 'bg-green-100 text-green-700' : 
                          ['new', 'prospect'].includes(lead.status) ? 'bg-blue-100 text-blue-700' : 
                          'bg-yellow-100 text-yellow-700'}`}>
                        {lead.status ? lead.status.replace(/_/g, ' ').toUpperCase() : 'NEW'}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button className="text-gray-400 hover:text-blue-600 font-medium transition">Detail</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    Belum ada data jemaah. Silakan input jemaah pertama anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;