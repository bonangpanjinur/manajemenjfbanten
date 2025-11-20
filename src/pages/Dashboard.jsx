// File Location: src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import StatCard from '../components/common/StatCard';

const Dashboard = () => {
    const { getDashboardStats, apiCall, loading } = useApi();
    const { currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [reportContent, setReportContent] = useState('');
    
    useEffect(() => {
        getDashboardStats().then(res => setStats(res)).catch(console.error);
    }, []);

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        if(!reportContent.trim()) return;
        try {
            await apiCall('/reports', 'POST', { user_id: currentUser?.id, content: reportContent });
            alert('Laporan terkirim!'); setReportContent('');
        } catch (err) { alert('Gagal: ' + err.message); }
    };

    if (loading || !stats) return <Loading text="Memuat..." />;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold">Halo, {currentUser?.full_name}!</h1>
            
            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Total Jamaah" value={stats.cards.total_jamaah} color="blue" />
                <StatCard title="Bulan Ini" value={stats.cards.new_jamaah_month} color="green" />
                <StatCard title="Omset" value={stats.cards.revenue} color="yellow" />
                <StatCard title="Sisa Kas" value={stats.cards.profit} color="indigo" />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white p-6 rounded shadow">
                    <h3 className="font-bold mb-4">Keberangkatan Terdekat</h3>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr><th className="p-2">Paket</th><th className="p-2">Tgl</th><th className="p-2">Jamaah</th></tr></thead>
                        <tbody>
                            {stats.upcoming?.map((pkg, i) => (
                                <tr key={i} className="border-b"><td className="p-2">{pkg.name}</td><td className="p-2">{pkg.departure_date}</td><td className="p-2 font-bold">{pkg.jamaah_count}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-blue-700 text-white p-6 rounded shadow">
                    <h3 className="font-bold mb-2">Lapor Pekerjaan Harian</h3>
                    <form onSubmit={handleSubmitReport}>
                        <textarea className="w-full p-2 rounded text-black mb-2" rows="5" placeholder="Apa yang dikerjakan hari ini?" value={reportContent} onChange={e => setReportContent(e.target.value)} required></textarea>
                        <button type="submit" className="w-full bg-white text-blue-800 font-bold py-2 rounded">Kirim Laporan</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;