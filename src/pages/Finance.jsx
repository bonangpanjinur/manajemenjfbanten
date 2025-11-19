import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import FinanceForm from '../components/forms/FinanceForm';
import StatCard from '../components/common/StatCard'; // Pastikan komponen ini ada atau ganti div biasa
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';

const Finance = () => {
    const { getFinanceStats, getCashFlow, getPayments } = useApi();
    const [stats, setStats] = useState({ total_in: 0, total_out: 0, balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [activeTab, setActiveTab] = useState('cashflow'); // 'cashflow' | 'payments'
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('operational'); // 'operational' | 'payment'

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Selalu update stats
            const statRes = await getFinanceStats();
            setStats(statRes || { total_in: 0, total_out: 0, balance: 0 });

            if (activeTab === 'cashflow') {
                const flowRes = await getCashFlow();
                setTransactions(flowRes || []);
            } else {
                const payRes = await getPayments();
                setPayments(payRes || []);
            }
        } catch (error) {
            console.error("Error finance data", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode) => {
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Keuangan & Kas</h1>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                    <div className="text-sm text-green-600 font-bold uppercase">Total Pemasukan</div>
                    <div className="text-2xl font-bold text-green-800">{formatIDR(stats.total_in)}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                    <div className="text-sm text-red-600 font-bold uppercase">Total Pengeluaran</div>
                    <div className="text-2xl font-bold text-red-800">{formatIDR(stats.total_out)}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                    <div className="text-sm text-blue-600 font-bold uppercase">Saldo Kas Saat Ini</div>
                    <div className="text-3xl font-bold text-blue-800">{formatIDR(stats.balance)}</div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                    <button 
                        onClick={() => setActiveTab('cashflow')}
                        className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'cashflow' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Arus Kas (Cash Flow)
                    </button>
                    <button 
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'payments' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Riwayat Pembayaran Jamaah
                    </button>
                </div>
                
                <div className="space-x-2">
                    <button onClick={() => openModal('operational')} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
                        + Kas Operasional
                    </button>
                    <button onClick={() => openModal('payment')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm shadow">
                        + Input Pembayaran Jamaah
                    </button>
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white rounded shadow overflow-hidden min-h-[300px]">
                {loading ? <Loading /> : (
                    <>
                        {activeTab === 'cashflow' && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kategori</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Deskripsi</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.transaction_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {t.type === 'in' ? 'MASUK' : 'KELUAR'}
                                                </span>
                                                <span className="ml-2">{t.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{t.description}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.type === 'in' ? '+' : '-'} {formatIDR(t.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">Belum ada transaksi</td></tr>}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'payments' && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Jamaah</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Metode</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {payments.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.payment_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{p.full_name}</div>
                                                <div className="text-xs text-gray-500">Paspor: {p.passport_number || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.payment_method}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                                                {formatIDR(p.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">Belum ada data pembayaran</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-2xl">
                        <FinanceForm 
                            mode={modalMode} 
                            onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
                            onCancel={() => setIsModalOpen(false)} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;