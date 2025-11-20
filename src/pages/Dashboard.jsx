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
        try {
            await apiCall('/hr/work-report', 'POST', { content: reportContent });
            alert('Laporan berhasil dikirim!');
            setReportContent('');
        } catch (err) {
            alert('Gagal kirim laporan');
        }
    };

    if (loading || !stats) return <Loading text="Memuat data dashboard..." />;

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            
            {/* Bagian Owner / Admin */}
            {(currentUser?.role === 'owner' || currentUser?.role === 'administrator') && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Total Jamaah" value={stats.cards.total_jamaah} icon="👥" color="blue" />
                        <StatCard title="Pendaftar Bulan Ini" value={stats.cards.new_jamaah_month} icon="📅" color="green" />
                        <StatCard title="Omset" value={`Rp ${stats.cards.revenue?.toLocaleString()}`} icon="💰" color="yellow" />
                        <StatCard title="Profit Estimasi" value={`Rp ${stats.cards.profit?.toLocaleString()}`} icon="📈" color="indigo" />
                    </div>
                    
                    {/* Grafik Sederhana (Placeholder) */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-4">Tren Pendaftaran (6 Bulan)</h3>
                        <div className="flex items-end space-x-2 h-40">
                            {stats.chart?.map((d, i) => (
                                <div key={i} className="bg-blue-500 w-full rounded-t hover:bg-blue-600 transition" 
                                     style={{height: `${d.count * 10}%`}} title={`${d.month}: ${d.count} Jamaah`}>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            {stats.chart?.map((d, i) => <span key={i}>{d.month}</span>)}
                        </div>
                    </div>
                </>
            )}

            {/* Poin 10: List Tugas Karyawan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Tugas Saya Hari Ini</h3>
                    {stats.my_tasks && stats.my_tasks.length > 0 ? (
                        <ul className="space-y-3">
                            {stats.my_tasks.map(task => (
                                <li key={task.id} className="p-3 border rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{task.title}</p>
                                        <p className="text-sm text-gray-500">{task.description}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {task.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Tidak ada tugas aktif.</p>
                    )}
                </div>

                {/* Poin 9: Laporan Pekerjaan */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Lapor Pekerjaan Harian</h3>
                    <form onSubmit={handleSubmitReport}>
                        <textarea 
                            className="w-full p-3 border rounded-lg mb-3" 
                            rows="4" 
                            placeholder="Apa yang Anda kerjakan hari ini?"
                            value={reportContent}
                            onChange={e => setReportContent(e.target.value)}
                            required
                        ></textarea>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
                            Kirim Laporan
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;