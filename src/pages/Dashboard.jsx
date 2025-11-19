import React from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { StatCard } from '../components/common/StatCard.jsx';
import { formatCurrency } from '../utils/helpers.js';
import { Users, Package, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const { data, loading } = useApi();
    
    // Ambil data dari context, gunakan fallback nilai 0 jika data belum siap
    const stats = data.stats || {};
    const jamaah = data.jamaah || [];
    const packages = data.packages || [];
    const finance = data.finance || [];

    // Hitung manual ringkasan sederhana jika API stats belum tersedia
    const totalJamaah = jamaah.length;
    const activePackages = packages.filter(p => p.status === 'available').length;
    const totalIncome = finance.filter(f => f.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const totalExpense = finance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    if (loading && !data.packages) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            
            {/* Grid Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Jemaah" 
                    value={totalJamaah} 
                    icon={<Users className="text-blue-600" />} 
                    color="bg-blue-50" 
                />
                <StatCard 
                    title="Paket Aktif" 
                    value={activePackages} 
                    icon={<Package className="text-green-600" />} 
                    color="bg-green-50" 
                />
                <StatCard 
                    title="Pemasukan" 
                    value={formatCurrency(totalIncome)} 
                    icon={<TrendingUp className="text-emerald-600" />} 
                    color="bg-emerald-50" 
                />
                <StatCard 
                    title="Pengeluaran" 
                    value={formatCurrency(totalExpense)} 
                    icon={<AlertCircle className="text-red-600" />} 
                    color="bg-red-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Widget Jemaah Terbaru */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Jemaah Terbaru</h3>
                    <div className="overflow-hidden">
                        {jamaah.length === 0 ? (
                            <p className="text-gray-500 italic">Belum ada data jemaah.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {jamaah.slice(0, 5).map(j => (
                                    <li key={j.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">{j.full_name}</p>
                                            <p className="text-xs text-gray-500">{j.passport_number || 'No Passport'}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${j.status === 'registered' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {j.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Widget Keuangan Terakhir */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Transaksi Terakhir</h3>
                    <div className="overflow-hidden">
                         {finance.length === 0 ? (
                            <p className="text-gray-500 italic">Belum ada transaksi.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {finance.slice(0, 5).map(f => (
                                    <li key={f.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">{f.description}</p>
                                            <p className="text-xs text-gray-500">{f.transaction_date}</p>
                                        </div>
                                        <span className={`font-bold ${f.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {f.type === 'income' ? '+' : '-'} {formatCurrency(f.amount)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;