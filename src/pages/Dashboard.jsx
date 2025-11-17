import React from 'react';
// PERBAIKAN: Menambahkan ekstensi file .jsx dan .js ke path
import { useApi } from '../context/ApiContext.jsx';
// PERBAIKAN: Impor bernama (named import) dan path 1 level ke atas
import { StatCard } from '../components/common/StatCard.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import { LoadingScreen } from '../components/common/Loading.jsx';
// AKHIR PERBAIKAN
import { Users, Package, DollarSign, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/helpers.js'; // PERBAIKAN: Path 1 level ke atas + ekstensi .js

const DashboardComponent = ({ openModal }) => {
    const { data, loading, error } = useApi();

    if (loading) {
        // PERBAIKAN: Gunakan LoadingScreen yang sudah diimpor
        return <LoadingScreen message="Memuat dashboard..." />;
    }

    if (error) {
        return <ErrorMessage title="Gagal Memuat" message={error} />;
    }

    const { stats, jamaah, packages } = data;

    // Hitung sisa kursi dari semua paket yang tersedia
    const availableSeats = packages
        .filter(p => p.status === 'available')
        .reduce((acc, p) => acc + (p.available_seats || 0), 0);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            
            {/* Grid Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Jamaah Aktif"
                    value={stats.total_jamaah || 0}
                    icon={<Users className="w-8 h-8 text-blue-500" />}
                    color="blue"
                />
                <StatCard
                    title="Total Paket Tersedia"
                    value={stats.available_packages || 0}
                    icon={<Package className="w-8 h-8 text-green-500" />}
                    color="green"
                />
                <StatCard
                    title="Sisa Kursi (Total)"
                    value={availableSeats} // Gunakan data kalkulasi
                    icon={<CheckCircle className="w-8 h-8 text-indigo-500" />}
                    color="indigo"
                />
                <StatCard
                    title="Total Piutang (Pending)"
                    value={formatCurrency(stats.total_pending_payments || 0)}
                    icon={<DollarSign className="w-8 h-8 text-yellow-500" />}
                    color="yellow"
                />
            </div>

            {/* Bagian Peringatan / Info Cepat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daftar Jamaah Terbaru */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Jamaah Baru</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {jamaah.slice(0, 5).map(j => ( // Ambil 5 terbaru
                            <div key={j.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div>
                                    <p className="font-medium text-gray-800">{j.name}</p>
                                    <p className="text-sm text-gray-500">{j.email}</p>
                                </div>
                                <span className="text-sm text-gray-600">{j.package_name || 'Tanpa Paket'}</span>
                            </div>
                        ))}
                        {jamaah.length === 0 && <p className="text-gray-500">Belum ada data jamaah.</p>}
                    </div>
                </div>

                {/* Paket Hampir Penuh */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Paket Akan Berangkat</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {packages.filter(p => p.status === 'available').slice(0, 5).map(p => (
                             <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div>
                                    <p className="font-medium text-gray-800">{p.name}</p>
                                    <p className="text-sm text-gray-500">Berangkat: {p.start_date}</p>
                                </div>
                                <span className="font-medium text-indigo-600">
                                    {p.available_seats} / {p.total_seats} kursi
                                </span>
                            </div>
                        ))}
                        {packages.length === 0 && <p className="text-gray-500">Belum ada data paket.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent;