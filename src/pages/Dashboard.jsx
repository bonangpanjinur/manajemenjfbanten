import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';

const Dashboard = () => {
    const { getDashboardStats, isOwner, currentUser, loading } = useApi();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getDashboardStats();
                setStats(res);
            } catch (err) {
                console.error("Gagal load dashboard", err);
            }
        };
        fetchStats();
    }, []);

    if (loading && !stats) return <Loading text="Memuat Dashboard..." />;
    if (!stats) return <div className="p-6">Gagal memuat data dashboard.</div>;

    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Header dengan greeting personal */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard Utama</h1>
                    <p className="text-gray-500 mt-1">
                        Selamat Datang, <span className="font-bold text-blue-600">{currentUser?.data?.display_name || 'User'}</span>! 
                        Anda login sebagai <span className="uppercase text-xs bg-gray-200 px-2 py-1 rounded font-bold">{isOwner ? 'Owner/Admin' : 'Staff'}</span>.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-sm text-gray-500">Tanggal Hari Ini</div>
                    <div className="text-lg font-bold text-gray-700">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* --- BAGIAN 1: STAT CARDS (DINAMIS SESUAI ROLE) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Kartu Umum (Semua Role) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <span className="text-2xl">👥</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Jamaah</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.cards.total_jamaah}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                        <span className="text-2xl">📈</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pendaftar Bulan Ini</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.cards.new_jamaah_month} <span className="text-sm text-gray-400 font-normal">Orang</span></h3>
                    </div>
                </div>

                {/* Kartu Khusus Owner/Admin (Keuangan) */}
                {isOwner ? (
                    <>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-xl shadow-lg text-white transform hover:-translate-y-1 transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-green-100 font-medium mb-1">Estimasi Keuntungan</p>
                                    <h3 className="text-2xl font-bold">{formatIDR(stats.cards.profit)}</h3>
                                </div>
                                <span className="text-2xl opacity-50">💰</span>
                            </div>
                            <div className="mt-4 text-xs text-green-100 bg-white/20 inline-block px-2 py-1 rounded">
                                Omset: {formatIDR(stats.cards.revenue)}
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center">
                            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                                <span className="text-2xl">💸</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Pengeluaran</p>
                                <h3 className="text-xl font-bold text-gray-800">{formatIDR(stats.cards.expense)}</h3>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Kartu Khusus Staff (Tugas/Paket) */
                    <>
                         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Paket Aktif</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.cards.active_packages}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center">
                             <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                <span className="text-2xl">📋</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Tugas Pending</p>
                                <h3 className="text-2xl font-bold text-gray-800">0</h3>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- BAGIAN 2: GRAFIK PENJUALAN (KIRI - LEBAR) --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Grafik Pertumbuhan Jamaah (6 Bulan Terakhir)</h3>
                    
                    {stats.chart.length > 0 ? (
                        <div className="flex items-end space-x-4 h-64 mt-4 pb-2 border-b border-l border-gray-200 pl-2">
                            {stats.chart.map((item, index) => {
                                // Hitung tinggi batang relatif (max 100%)
                                const maxVal = Math.max(...stats.chart.map(d => parseInt(d.count)));
                                const height = maxVal > 0 ? (parseInt(item.count) / maxVal) * 100 : 0;
                                
                                return (
                                    <div key={index} className="flex-1 flex flex-col justify-end items-center group">
                                        <div className="text-xs font-bold text-blue-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.count}
                                        </div>
                                        <div 
                                            className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all relative"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        ></div>
                                        <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left translate-y-4">
                                            {item.month}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">Belum ada data grafik</div>
                    )}
                </div>

                {/* --- BAGIAN 3: WIDGET KANAN --- */}
                <div className="space-y-6">
                    
                    {/* Widget Alert (Peringatan) */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <span className="text-red-500 mr-2">⚠</span> Perlu Perhatian
                        </h3>
                        <div className="space-y-3">
                            {stats.alerts.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Tidak ada peringatan mendesak.</p>
                            ) : (
                                stats.alerts.map((alert, idx) => (
                                    <div key={idx} className="p-3 bg-red-50 rounded border border-red-100 flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">{alert.full_name}</div>
                                            <div className="text-xs text-red-600">Paspor Exp: {alert.passport_expiry_date}</div>
                                        </div>
                                        <button className="text-xs bg-white border border-red-200 px-2 py-1 rounded text-red-600 hover:bg-red-50">Cek</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Widget Keberangkatan Terdekat */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <span className="text-blue-500 mr-2">✈</span> Keberangkatan Terdekat
                        </h3>
                        <div className="space-y-3">
                            {stats.upcoming.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Belum ada jadwal paket aktif.</p>
                            ) : (
                                stats.upcoming.map((pkg) => (
                                    <div key={pkg.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition cursor-pointer">
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">{pkg.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {pkg.departure_date} • {pkg.jamaah_count} Jamaah
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                            {pkg.airline_name}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full mt-3 text-sm text-blue-600 font-medium hover:underline">Lihat Semua Jadwal →</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;