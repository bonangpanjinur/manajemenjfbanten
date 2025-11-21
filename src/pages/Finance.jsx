import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import StatCard from '../components/common/StatCard';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import TransactionForm from '../components/forms/TransactionForm';

export default function Finance() {
    const { api } = useApi();
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('all'); // all, in, out

    const fetchData = async () => {
        setLoading(true);
        try {
            // Ambil Summary
            const sumData = await api.get('/finance/summary');
            setSummary(sumData);

            // Ambil List Transaksi (Buku Besar)
            const transData = await api.get('/finance/transactions');
            setTransactions(transData);
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTransaction = async (data) => {
        try {
            await api.post('/finance/transactions', data);
            setIsModalOpen(false);
            fetchData(); // Refresh data setelah simpan
            alert('Transaksi berhasil disimpan');
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan transaksi');
        }
    };

    // Filter Logic di Client Side (untuk responsivitas cepat)
    const filteredTransactions = transactions.filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
    });

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Keuangan & Buku Besar</h1>
                    <p className="text-gray-500 text-sm">Monitor arus kas masuk dan keluar perusahaan.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"
                >
                    <span className="mr-2 text-lg font-bold">+</span> Catat Transaksi
                </button>
            </div>

            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <div className="text-gray-500 text-sm font-medium">Total Pemasukan</div>
                    <div className="text-2xl font-bold text-gray-800 mt-1">
                        Rp {summary.total_income.toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                    <div className="text-gray-500 text-sm font-medium">Total Pengeluaran</div>
                    <div className="text-2xl font-bold text-gray-800 mt-1">
                        Rp {summary.total_expense.toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <div className="text-gray-500 text-sm font-medium">Saldo Kas (Net)</div>
                    <div className={`text-2xl font-bold mt-1 ${summary.net_balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        Rp {summary.net_balance.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            {/* Tabel Buku Besar */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">Jurnal Transaksi</h3>
                    <div className="flex space-x-2">
                        <button onClick={() => setFilterType('all')} className={`px-3 py-1 text-sm rounded-full ${filterType === 'all' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600'}`}>Semua</button>
                        <button onClick={() => setFilterType('in')} className={`px-3 py-1 text-sm rounded-full ${filterType === 'in' ? 'bg-green-600 text-white' : 'bg-white border text-gray-600'}`}>Masuk</button>
                        <button onClick={() => setFilterType('out')} className={`px-3 py-1 text-sm rounded-full ${filterType === 'out' ? 'bg-red-600 text-white' : 'bg-white border text-gray-600'}`}>Keluar</button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit (Masuk)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kredit (Keluar)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.map((trx) => (
                                <tr key={trx.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {trx.transaction_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trx.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {trx.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {trx.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                                        {trx.type === 'in' ? `Rp ${parseFloat(trx.amount).toLocaleString('id-ID')}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                                        {trx.type === 'out' ? `Rp ${parseFloat(trx.amount).toLocaleString('id-ID')}` : '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        Belum ada transaksi yang tercatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Catat Transaksi Baru"
            >
                <TransactionForm 
                    onSubmit={handleCreateTransaction}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}