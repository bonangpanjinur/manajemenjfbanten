import React from 'react';
import { useApi } from '../context/ApiContext';
import { StatCard } from '../components/common/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUsers, FaMoneyBillWave, FaPlane } from 'react-icons/fa';

const Dashboard = () => {
    const { data } = useApi();
    const { stats, user } = data; // stats di-fetch dari api-stats.php

    // Contoh data dummy jika API belum siap (untuk visualisasi)
    const chartData = stats?.monthly_income || [
        { name: 'Jan', income: 4000, expense: 2400 },
        { name: 'Feb', income: 3000, expense: 1398 },
        { name: 'Mar', income: 2000, expense: 9800 },
        { name: 'Apr', income: 2780, expense: 3908 },
    ];

    const pieData = [
        { name: 'Lunas', value: 400 },
        { name: 'Belum Lunas', value: 300 },
    ];
    const COLORS = ['#0088FE', '#FF8042'];

    const isOwner = user?.role === 'owner';

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Jemaah" value={stats?.total_jamaah || 0} icon={<FaUsers />} color="blue" />
                <StatCard title="Paket Aktif" value={stats?.active_packages || 0} icon={<FaPlane />} color="green" />
                {isOwner && (
                    <StatCard title="Total Pendapatan" value={`Rp ${(stats?.total_revenue || 0).toLocaleString()}`} icon={<FaMoneyBillWave />} color="yellow" />
                )}
            </div>

            {/* Charts Section - Visible to Owner/Admin */}
            {isOwner && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Arus Kas Bulanan</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="income" fill="#82ca9d" name="Pemasukan" />
                                    <Bar dataKey="expense" fill="#8884d8" name="Pengeluaran" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Status Pembayaran Jemaah</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Specific View */}
            {!isOwner && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold">Tugas & Notifikasi Anda</h3>
                    <p className="text-gray-600">Selamat datang kembali. Silakan cek menu divisi Anda untuk tugas terbaru.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;