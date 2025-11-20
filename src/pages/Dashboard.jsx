// File Location: src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import StatCard from '../components/common/StatCard';
import { FaChartLine, FaUserCheck, FaMoneyBillWave, FaWallet, FaPlaneDeparture } from 'react-icons/fa';

const Dashboard = () => {
    const { getDashboardStats, apiCall, loading } = useApi();
    const { currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [reportContent, setReportContent] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    
    useEffect(() => {
        getDashboardStats().then(res => setStats(res)).catch(console.error);
    }, []);

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        if(!reportContent.trim()) return;
        setIsReporting(true);
        try {
            await apiCall('/reports', 'POST', { user_id: currentUser?.id, content: reportContent });
            alert('Laporan kerja berhasil dikirim!'); 
            setReportContent('');
        } catch (err) { 
            alert('Gagal: ' + err.message); 
        } finally {
            setIsReporting(false);
        }
    };

    if (loading || !stats) return <Loading text="Menyiapkan Dashboard..." />;
    const idr = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits:0 }).format(n);

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Selamat datang, <span className="font-semibold text-blue-600">{currentUser?.full_name}</span>!</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Total Jamaah" value={stats.cards.total_jamaah} icon={<FaUserCheck />} color="blue" />
                <StatCard title="Jamaah Bulan Ini" value={stats.cards.new_jamaah_month} icon={<FaChartLine />} color="green" />
                <StatCard title="Total Pemasukan" value={idr(stats.cards.revenue)} icon={<FaMoneyBillWave />} color="yellow" />
                <StatCard title="Saldo Kas" value={idr(stats.cards.profit)} icon={<FaWallet />} color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                        <FaPlaneDeparture className="text-blue-500" />
                        <h3 className="font-bold text-gray-800">Jadwal Keberangkatan Terdekat</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="p-4 font-medium">Nama Paket</th>
                                    <th className="p-4 font-medium">Maskapai</th>
                                    <th className="p-4 font-medium">Tanggal</th>
                                    <th className="p-4 font-medium text-center">Jamaah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {stats.upcoming?.map((pkg, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-900">{pkg.name}</td>
                                        <td className="p-4 text-gray-600">{pkg.airline_name}</td>
                                        <td className="p-4 text-blue-600 font-medium">{pkg.departure_date}</td>
                                        <td className="p-4 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">{pkg.jamaah_count}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
                        <h3 className="font-bold text-white">Laporan Kinerja Harian</h3>
                        <p className="text-blue-100 text-xs mt-1">Wajib diisi sebelum pulang.</p>
                    </div>
                    <div className="p-5 flex-1">
                        <form onSubmit={handleSubmitReport} className="flex flex-col h-full">
                            <textarea className="w-full p-3 rounded-lg border border-gray-300 text-sm flex-1 mb-4 resize-none" rows="6" placeholder="Tuliskan hasil pekerjaan hari ini..." value={reportContent} onChange={e => setReportContent(e.target.value)} required></textarea>
                            <button type="submit" disabled={isReporting} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg shadow-md disabled:bg-gray-400">Kirim Laporan</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;