import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import StatCard from '../components/common/StatCard';
import FinanceForm from '../components/forms/FinanceForm';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import JamaahLedger from '../components/finance/JamaahLedger'; // Import Komponen Baru

const Finance = () => {
    const { api } = useApi();
    const [activeTab, setActiveTab] = useState('ledger'); // Default ke Buku Besar agar langsung terlihat
    const [showModal, setShowModal] = useState(false);
    const [cashflow, setCashflow] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadCashflow = async () => {
        setLoading(true);
        try {
            const res = await api.get('/finance/cashflow');
            setCashflow(res || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Load cashflow hanya jika tab cashflow aktif
    React.useEffect(() => {
        if(activeTab === 'cashflow') loadCashflow();
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Keuangan & Pembayaran</h1>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('ledger')}
                        className={`${activeTab === 'ledger' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <span className="dashicons dashicons-book"></span> Buku Besar Jemaah
                    </button>
                    <button
                        onClick={() => setActiveTab('cashflow')}
                        className={`${activeTab === 'cashflow' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <span className="dashicons dashicons-chart-line"></span> Arus Kas (Cashflow)
                    </button>
                </nav>
            </div>

            {/* Tab Content: BUKU BESAR */}
            {activeTab === 'ledger' && (
                <JamaahLedger />
            )}

            {/* Tab Content: CASHFLOW */}
            {activeTab === 'cashflow' && (
                <div className="space-y-6">
                    {/* Stats Cashflow (Dummy data for layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Pemasukan Bulan Ini" value="Rp 150.000.000" type="increase" percentage="12%" />
                        <StatCard title="Pengeluaran Bulan Ini" value="Rp 45.000.000" type="decrease" percentage="5%" />
                        <StatCard title="Saldo Kas" value="Rp 105.000.000" />
                    </div>

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="font-medium text-gray-900">Jurnal Transaksi Umum</h3>
                            <button onClick={() => setShowModal(true)} className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
                                + Catat Transaksi
                            </button>
                        </div>
                        {loading ? <Loading /> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masuk</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keluar</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {cashflow.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-400">Belum ada data</td></tr>}
                                    {cashflow.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.category}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{tx.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                {tx.type === 'in' ? `Rp ${parseInt(tx.amount).toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                {tx.type === 'out' ? `Rp ${parseInt(tx.amount).toLocaleString()}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Catat Transaksi Kas">
                <FinanceForm onSubmit={(data) => {
                    api.post('/finance/transaction', data).then(() => {
                        setShowModal(false);
                        loadCashflow();
                    });
                }} onCancel={() => setShowModal(false)} />
            </Modal>
        </div>
    );
};

export default Finance;