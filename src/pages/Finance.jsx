import React, { useState, useMemo } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { Modal } from '../components/common/Modal.jsx';
import FinanceForm from '../components/forms/FinanceForm.jsx';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const Finance = () => {
    const { data, loading, deleteItem } = useApi();
    // Safe access untuk mencegah error "map of undefined"
    const transactions = data.finance || [];
    const accounts = data.accounts || [];

    const [modalState, setModalState] = useState({ isOpen: false, data: null });
    const [filter, setFilter] = useState('');

    const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0), [transactions]);
    const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0), [transactions]);

    const filteredData = useMemo(() => {
        return transactions.filter(t => t.description.toLowerCase().includes(filter.toLowerCase()));
    }, [transactions, filter]);

    const handleDelete = async (id) => {
        if (confirm('Hapus transaksi ini?')) {
            try {
                await deleteItem('finance', id);
            } catch (e) { alert(e.message); }
        }
    };

    if (loading && transactions.length === 0) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
                <button 
                    onClick={() => setModalState({ isOpen: true, data: null })}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2"/> Tambah Transaksi
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div><div className="text-sm text-gray-500">Pemasukan</div><div className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</div></div>
                    <TrendingUp className="text-green-200 w-8 h-8"/>
                </div>
                <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div><div className="text-sm text-gray-500">Pengeluaran</div><div className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</div></div>
                    <TrendingDown className="text-red-200 w-8 h-8"/>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <div className="text-sm text-gray-500">Saldo Bersih</div>
                    <div className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(totalIncome - totalExpense)}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded shadow overflow-hidden">
                <input 
                    className="m-4 p-2 border rounded w-64" 
                    placeholder="Cari transaksi..." 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)} 
                />
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Deskripsi</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nominal</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tipe</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.transaction_date)}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.description}</td>
                                <td className={`px-6 py-4 font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(item.amount)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => setModalState({ isOpen: true, data: item })} className="text-blue-600"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">Tidak ada data.</td></tr>}
                    </tbody>
                </table>
            </div>

            <Modal 
                title={modalState.data ? 'Edit Transaksi' : 'Tambah Transaksi'} 
                isOpen={modalState.isOpen} 
                onClose={() => setModalState({ isOpen: false, data: null })}
            >
                <FinanceForm 
                    initialData={modalState.data} 
                    accounts={accounts} // Pass accounts data
                    onSubmit={async (formData) => {
                        // Wrapper untuk handle submit di form
                        const { createOrUpdate } = useApi();
                        await createOrUpdate('finance', formData, modalState.data?.id);
                        setModalState({ isOpen: false, data: null });
                    }}
                    onCancel={() => setModalState({ isOpen: false, data: null })}
                />
            </Modal>
        </div>
    );
};

export default Finance;