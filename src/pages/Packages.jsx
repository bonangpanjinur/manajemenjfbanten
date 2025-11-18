import React, { useState, useMemo } from 'react';
import { useApi } from '../context/ApiContext.jsx'; // Pastikan ekstensi .jsx
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import { Modal } from '../components/common/Modal.jsx';
import PackageForm from '../components/forms/PackageForm.jsx';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import { Plus, Search, Edit, Trash2, PackageX, Calendar, Users } from 'lucide-react';

const Packages = () => {
    const { data, loading, error, deleteItem, refreshData } = useApi();
    const { packages = [] } = data || {};
    
    const [filter, setFilter] = useState('');
    const [modal, setModal] = useState({ isOpen: false, data: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

    // Filter Data
    const filteredData = useMemo(() => {
        return packages.filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(filter.toLowerCase()))
        );
    }, [packages, filter]);

    // Helper harga terendah
    const getLowestPrice = (priceDetails) => {
        if (!priceDetails) return 0;
        try {
            let details = typeof priceDetails === 'string' ? JSON.parse(priceDetails) : priceDetails;
            const prices = Array.isArray(details)
                ? details.map(d => parseFloat(d.price))
                : Object.values(details).map(p => parseFloat(p));
            return prices.length ? Math.min(...prices.filter(p => p > 0)) : 0;
        } catch (e) { return 0; }
    };

    // Actions
    const handleDelete = async () => {
        if (confirmModal.id) {
            try {
                await deleteItem('package', confirmModal.id);
                refreshData('packages');
                setConfirmModal({ isOpen: false, id: null });
            } catch (error) {
                alert('Gagal menghapus paket.');
            }
        }
    };

    if (loading && packages.length === 0) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Paket Umroh</h1>
                    <p className="text-gray-500 text-sm">Kelola semua paket perjalanan Anda di sini.</p>
                </div>
                <button
                    onClick={() => setModal({ isOpen: true, data: null })}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Paket Baru
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Cari paket berdasarkan nama..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {/* Table Section */}
            <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Paket</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Info</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Harga Mulai</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seat</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <PackageX className="w-16 h-16 mb-4 opacity-50" />
                                            <h3 className="text-lg font-medium text-gray-900">Tidak ada paket ditemukan</h3>
                                            <p className="mb-4">Coba kata kunci lain atau buat paket baru.</p>
                                            <button
                                                onClick={() => setModal({ isOpen: true, data: null })}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                + Buat Paket Sekarang
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1">{item.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                {item.duration_days} Hari
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.start_date ? `${formatDate(item.start_date)}` : 'TBA'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                                {formatCurrency(getLowestPrice(item.price_details) || item.price)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Users className="w-3 h-3 mr-1" />
                                                <span className={item.available_seats < 10 ? "text-red-600 font-bold" : ""}>
                                                    {item.available_seats}
                                                </span>
                                                <span className="text-gray-400 mx-1">/</span>
                                                {item.total_seats}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.status === 'available' ? 'bg-blue-100 text-blue-800' :
                                                item.status === 'full' ? 'bg-red-100 text-red-800' :
                                                item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.status === 'available' ? 'Tersedia' : item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-3">
                                                <button 
                                                    onClick={() => setModal({ isOpen: true, data: item })} 
                                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                    title="Edit Paket"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmModal({ isOpen: true, id: item.id })} 
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                    title="Hapus Paket"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form Paket */}
            <Modal 
                title={modal.data ? 'Edit Paket' : 'Tambah Paket Baru'} 
                isOpen={modal.isOpen} 
                onClose={() => setModal({ isOpen: false, data: null })}
                size="4xl" // Ukuran modal lebih lebar
            >
                <PackageForm 
                    data={modal.data} 
                    onClose={() => {
                        setModal({ isOpen: false, data: null });
                        refreshData('packages');
                    }} 
                />
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                title="Hapus Paket"
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                size="sm"
            >
                <div className="p-2">
                    <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus paket ini? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setConfirmModal({ isOpen: false, id: null })}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
                        >
                            Hapus Paket
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Packages;