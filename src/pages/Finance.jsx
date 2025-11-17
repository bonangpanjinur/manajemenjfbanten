// Lokasi: src/pages/Finance.jsx

import React, { useState, useMemo } from 'react';
// --- PERBAIKAN: Path import relatif ---
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import FinanceForm from '../components/forms/FinanceForm';
import { formatDate, formatCurrency } from '../utils/helpers';
// --- AKHIR PERBAIKAN ---

const Finance = () => {
    const api = useApi();
    const { data, loading, error } = api;
    const [filter, setFilter] = useState('');
    const [modal, setModal] = useState({ isOpen: false, data: null });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;

    const categoriesMap = useMemo(() => {
        return (data.categories || []).reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {});
    }, [data.categories]);

    const jamaahMap = useMemo(() => {
        return (data.jamaah || []).reduce((acc, j) => {
            acc[j.id] = j.full_name;
            return acc;
        }, {});
    }, [data.jamaah]);

    const filteredData = useMemo(() => {
        return (data.finance || []).filter(item =>
            item.description.toLowerCase().includes(filter.toLowerCase()) ||
            (categoriesMap[item.category_id] && categoriesMap[item.category_id].toLowerCase().includes(filter.toLowerCase())) ||
            (jamaahMap[item.related_jamaah_id] && jamaahMap[item.related_jamaah_id].toLowerCase().includes(filter.toLowerCase()))
        ).sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)); // Sortir terbaru dulu
    }, [data.finance, filter, categoriesMap, jamaahMap]);

    const totals = useMemo(() => {
        return (data.finance || []).reduce((acc, item) => {
            if (item.status === 'completed') {
                if (item.type === 'income') {
                    acc.income += parseFloat(item.amount);
                } else if (item.type === 'expense') {
                    acc.expense += parseFloat(item.amount);
                }
            }
            return acc;
        }, { income: 0, expense: 0 });
    }, [data.finance]);
    const profit = totals.income - totals.expense;

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: 'Apakah Anda yakin ingin menghapus data transaksi ini? (Transaksi dari pembayaran jemaah tidak bisa dihapus di sini)',
            onConfirm: async () => {
                try {
                    await api.deleteItem('finance', id);
                    api.refreshData('finance'); 
                    setConfirmModal({ ...confirmModal, isOpen: false });
                } catch (error) {
                    console.error('Gagal menghapus transaksi:', error);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                }
            },
        });
    };

    const handleVerify = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Verifikasi',
            message: 'Apakah Anda yakin ingin memverifikasi transaksi ini?',
            onConfirm: async () => {
                try {
                    await api.createOrUpdate('finance', { id: id, status: 'completed' });
                    api.refreshData('finance');
                    setConfirmModal({ ...confirmModal, isOpen: false });
                } catch (error) {
                    console.error('Gagal verifikasi:', error);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                }
            },
        });
    };

    const handleEdit = (item) => {
        setModal({ isOpen: true, data: item });
    };

    const handleSuccess = () => {
        setModal({ isOpen: false, data: null });
        api.refreshData('finance');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Manajemen Keuangan</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-100 p-6 rounded-lg shadow">
                    <h4 className="text-lg font-semibold text-green-800">Total Pemasukan</h4>
                    <p className="text-3xl font-bold text-green-900">{formatCurrency(totals.income)}</p>
                </div>
                <div className="bg-red-100 p-6 rounded-lg shadow">
                    <h4 className="text-lg font-semibold text-red-800">Total Pengeluaran</h4>
                    <p className="text-3xl font-bold text-red-900">{formatCurrency(totals.expense)}</p>
                </div>
                <div className="bg-blue-100 p-6 rounded-lg shadow">
                    <h4 className="text-lg font-semibold text-blue-800">Keuntungan (Profit)</h4>
                    <p className="text-3xl font-bold text-blue-900">{formatCurrency(profit)}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Cari transaksi (deskripsi, kategori, jemaah)..."
                    className="px-4 py-2 border rounded-lg w-1/3"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button
                    onClick={() => setModal({ isOpen: true, data: null })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
                >
                    + Tambah Transaksi Manual
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terkait</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(item.transaction_date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{categoriesMap[item.category_id] || 'Tanpa Kategori'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${item.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                                    {item.type === 'expense' ? '-' : ''}{formatCurrency(item.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {item.related_jamaah_id ? jamaahMap[item.related_jamaah_id] : (item.related_payment_id ? `Pembayaran #${item.related_payment_id}` : '-')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        {item.status === 'pending' && (
                                            <button onClick={() => handleVerify(item.id)} className="text-green-600 hover:text-green-900">Verifikasi</button>
                                        )}
                                        {!item.related_payment_id && (
                                            <>
                                                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data transaksi yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {confirmModal.isOpen && (
                <Modal
                    title={confirmModal.title}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                >
                    <p className="mb-6">{confirmModal.message}</p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                        >
                            Batal
                        </button>
                        <button
                            onClick={confirmModal.onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Konfirmasi
                        </button>
                    </div>
                </Modal>
            )}

            {modal.isOpen && (
                <Modal title={modal.data ? 'Edit Transaksi' : 'Tambah Transaksi'} onClose={() => setModal({ isOpen: false, data: null })}>
                    <FinanceForm data={modal.data} onSuccess={handleSuccess} />
                </Modal>
            )}
        </div>
    );
};

export default Finance;