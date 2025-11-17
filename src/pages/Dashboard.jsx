// Lokasi: src/pages/Dashboard.jsx

import React from 'react';
// --- PERBAIKAN: Path import relatif dengan ekstensi .jsx ---
import { useApi } from '../context/ApiContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '../components/common/Loading.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import StatCard from '../components/common/StatCard.jsx';
// --- AKHIR PERBAIKAN ---
import { 
    ResponsiveContainer, 
// ... sisa kode ...
// ... (Kode yang ada sebelumnya tidak diubah) ...
    CartesianGrid, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Legend, 
    Line, 
    Bar 
} from 'recharts';

const Dashboard = () => {
    const { data, loading, error } = useApi();
    const { currentUser } = useAuth();
    const { stats } = data;

    if (loading && !stats) return <Loading text="Memuat data dashboard..." />;
    if (error) return <ErrorMessage message={error} />;

    const financeChartData = stats?.financeChartData || [];
    const packageChartData = stats?.packageChartData || [];

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <p className="text-lg mb-8">Selamat datang, <span className="font-semibold">{currentUser?.full_name || currentUser?.user_email}</span>!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Jemaah" 
                    value={stats?.total_jamaah || 0} 
                    description="Jumlah jemaah terdaftar"
                />
                <StatCard 
                    title="Jemaah Bulan Ini" 
                    value={stats?.new_jamaah_this_month || 0} 
                    description="Pendaftaran baru"
                />
                <StatCard 
                    title="Total Piutang" 
                    value={stats?.total_receivables ? `Rp ${Number(stats.total_receivables).toLocaleString('id-ID')}` : 'Rp 0'} 
                    description="Total tagihan belum lunas"
                />
                <StatCard 
                    title="Leads Baru" 
                    value={stats?.new_leads_this_month || 0} 
                    description="Leads bulan ini"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Grafik Keuangan (6 Bulan Terakhir)</h2>
                    {financeChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={financeChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `Rp${value/1000000} Jt`} />
                                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                                <Legend />
                                <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500">Data chart keuangan belum tersedia.</p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Paket Terpopuler (Top 5)</h2>
                    {packageChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={packageChartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => `${value} Jemaah`} />
                                <Legend />
                                <Bar dataKey="jamaah" name="Jumlah Jemaah" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500">Data chart paket belum tersedia.</p>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Aktivitas Terbaru</h2>
                { (data.logs && data.logs.length > 0) ? (
                    <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {data.logs.slice(0, 5).map(log => (
                             <li key={log.id} className="py-3">
                                <p><span className="font-semibold">{log.user_email || 'Sistem'}</span> {log.description}</p>
                                <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Belum ada aktivitas terbaru.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;