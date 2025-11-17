import React, { useState, useMemo } from 'react';
// PERBAIKAN: Path 1 level ke atas + ekstensi .jsx
import { useApi } from '../context/ApiContext.jsx';
// PERBAIKAN: Impor bernama (named import) dan path 1 level ke atas + ekstensi .jsx
import { LoadingScreen, LoadingSpinner } from '../components/common/Loading.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import { Modal } from '../components/common/Modal.jsx';
// PERBAIKAN: Path 1 level ke atas + ekstensi .jsx
import FinanceForm from '../components/forms/FinanceForm.jsx';
import { Button, Input } from '../components/common/FormUI.jsx';
// PERBAIKAN: Path 1 level ke atas + ekstensi .js
import { formatCurrency, formatDate } from '../utils/helpers.js';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Filter } from 'lucide-react';

const FinanceComponent = () => {
    const { data, loading, error, createOrUpdate, deleteItem } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('');

    const openModal = (item = null) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                await deleteItem('finance', id);
            } catch (err) {
                alert('Gagal menghapus: ' + err.message);
            }
        }
    };

    const filteredData = useMemo(() => {
        return data.finance.filter(item =>
            item.description.toLowerCase().includes(filter.toLowerCase()) ||
            item.category.toLowerCase().includes(filter.toLowerCase())
        );
    }, [data.finance, filter]);

    const totalIncome = useMemo(() => {
        return data.finance
            .filter(item => item.type === 'income')
            .reduce((acc, item) => acc + parseFloat(item.amount), 0);
    }, [data.finance]);

    const totalExpense = useMemo(() => {
        return data.finance
            .filter(item => item.type === 'expense')
            .reduce((acc, item) => acc + parseFloat(item.amount), 0);
    }, [data.finance]);

    const netProfit = totalIncome - totalExpense;

    if (loading && !data.finance.length) {
        // PERBAIKAN: Gunakan LoadingScreen
        return <LoadingScreen message="Memuat data keuangan..." />;
    }

    if (error) {
        return <ErrorMessage title="Gagal Memuat" message={error} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Keuangan</h1>
                <Button onClick={() => openModal()} className="mt-4 md:mt-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Transaksi
                </Button>
            </div>

            {/* Stat Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox label="Total Pemasukan" value={formatCurrency(totalIncome)} color="text-green-600" icon={<TrendingUp />} />
                <StatBox label="Total Pengeluaran" value={formatCurrency(totalExpense)} color="text-red-600" icon={<TrendingDown />} />
                <StatBox label="Profit Bersih" value={formatCurrency(netProfit)} color={netProfit >= 0 ? "text-blue-600" : "text-red-600"} />
            </div>

            {/* Filter dan Tabel */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                    <Filter className="w-5 h-5 text-gray-500 mr-2" />
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan deskripsi atau kategori..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan="6" className="text-center p-4"><LoadingSpinner /></td>
                                </tr>
                            )}
                            {!loading && filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center p-4 text-gray-500">Data tidak ditemukan.</td>
                                </tr>
                            )}
                            {!loading && filteredData.map((item) => {
                                const isIncome = item.type === 'income';
                                const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
                                const amountPrefix = isIncome ? '+' : '-';
                                
                                return (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.transaction_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${amountColor}`}>
                                            {amountPrefix} {formatCurrency(item.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button variant="icon" size="sm" onClick={() => openModal(item)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="icon" size="sm" color="danger" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                // PERBAIKAN: Gunakan Modal
                <Modal title={selectedItem ? 'Edit Transaksi' : 'Tambah Transaksi'} onClose={closeModal}>
                    <div className="p-6">
                        <FinanceForm data={selectedItem} onClose={closeModal} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

const StatBox = ({ label, value, color, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-center">
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10 mr-4`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
        </div>
        <div>
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

export default FinanceComponent;