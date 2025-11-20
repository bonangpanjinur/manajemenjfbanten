import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext'; // PERBAIKAN: Import dari AuthContext
import Loading from '../components/common/Loading';

const Dashboard = () => {
    const { getDashboardStats, loading } = useApi();
    const { currentUser } = useAuth(); // PERBAIKAN: Ambil user dari AuthContext
    const [stats, setStats] = useState(null);

    // Logika Tampilan Berdasarkan Role
    const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'administrator';

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            try {
                const res = await getDashboardStats();
                if (isMounted) setStats(res);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                // Opsional: setStats(mockData) jika ingin fallback data dummy
            }
        };

        fetchStats();

        return () => { isMounted = false; };
    }, [getDashboardStats]);

    if (loading && !stats) return <Loading text="Memuat Dashboard..." />;

    // Fallback jika API gagal atau data kosong
    if (!stats) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-gray-500 h-full">
                <h2 className="text-xl font-semibold mb-2">Data Dashboard Tidak Tersedia</h2>
                <p>Silakan periksa koneksi internet atau coba muat ulang halaman.</p>
            </div>
        );
    }

    const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">
                        Assalamualaikum, <span className="font-bold text-blue-600">{currentUser?.full_name || 'User'}</span>.
                    </p>
                </div>
                <div className="text-left md:text-right bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Hari Ini</p>
                    <p className="text-sm font-medium text-gray-700">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Total Jamaah */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                    <div className="p-4 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <span className="text-2xl">👥</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Jamaah</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.cards?.total_jamaah || 0}</h3>
                    </div>
                </div>

                {/* Card 2: Pendaftar Bulan Ini */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                    <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                        <span className="text-2xl">📅</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Jamaah Baru</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.cards?.new_jamaah_month || 0}</h3>
                    </div>
                </div>

                {/* Card 3 & 4: Spesifik Role */}
                {isOwner ? (
                    <>
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl shadow-lg text-white transform hover:-translate-y-1 transition duration-200">
                            <p className="text-emerald-100 text-sm font-medium mb-1">Estimasi Keuntungan</p>
                            <h3 className="text-2xl font-bold">{formatIDR(stats?.cards?.profit)}</h3>
                            <div className="mt-3 text-xs bg-white/20 inline-block px-2 py-1 rounded backdrop-blur-sm">
                                Omset: {formatIDR(stats?.cards?.revenue)}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                            <div className="p-4 rounded-full bg-red-50 text-red-600 mr-4">
                                <span className="text-2xl">💸</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Pengeluaran</p>
                                <h3 className="text-xl font-bold text-gray-900">{formatIDR(stats?.cards?.expense)}</h3>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                            <div className="p-4 rounded-full bg-yellow-50 text-yellow-600 mr-4">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Paket Aktif</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats?.cards?.active_packages || 0}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                             <div className="p-4 rounded-full bg-purple-50 text-purple-600 mr-4">
                                <span className="text-2xl">📋</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Tugas Pending</p>
                                <h3 className="text-2xl font-bold text-gray-900">0</h3>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Chart & Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Grafik */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Statistik Pertumbuhan Jamaah</h3>
                    {stats?.chart && stats.chart.length > 0 ? (
                        <div className="h-64 flex items-end space-x-4 border-b border-gray-200 pb-2 px-2">
                            {stats.chart.map((item, idx) => {
                                const maxVal = Math.max(...stats.chart.map(d => parseInt(d.count))) || 10;
                                const height = (parseInt(item.count) / maxVal) * 100;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col justify-end items-center group">
                                        <div className="mb-2 opacity-0 group-hover:opacity-100 transition text-xs font-bold text-blue-600">
                                            {item.count}
                                        </div>
                                        <div 
                                            className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all relative"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        ></div>
                                        <div className="mt-3 text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                                            {item.month}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded border border-dashed">
                            Data grafik belum tersedia
                        </div>
                    )}
                </div>

                {/* Widget Kanan */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
                            Jadwal Keberangkatan
                        </h3>
                        <div className="space-y-3">
                            {stats?.upcoming && stats.upcoming.length > 0 ? (
                                stats.upcoming.map((pkg, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer">
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">{pkg.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {pkg.departure_date} • {pkg.jamaah_count} Pax
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded shadow-sm">
                                            {pkg.airline_name}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">Belum ada jadwal.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;