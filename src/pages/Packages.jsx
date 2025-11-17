// Lokasi: src/pages/Packages.jsx

import React, { useState, useMemo } from 'react';
// --- PERBAIKAN: Path import relatif ---
import { useApi } from '../context/ApiContext';
// --- PERBAIKAN: Impor bernama (named import) ---
import { LoadingSpinner as Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Modal } from '../components/common/Modal';
// --- PERBAIKAN: Menambahkan ekstensi .jsx ---
import PackageForm from '../components/forms/PackageForm';
// --- PERBAIKAN: Menambahkan ekstensi .js ---
import { formatCurrency, formatDate } from '../utils/helpers';
// --- AKHIR PERBAIKAN ---

const Packages = () => {
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

    if (loading && !data.packages.length) return <Loading />; // PERBAIKAN: Pastikan loading state awal tidak error
    if (error) return <ErrorMessage message={error} />;

    const filteredData = useMemo(() => {
        return (data.packages || []).filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(filter.toLowerCase()))
        );
    }, [data.packages, filter]);

    const getLowestPrice = (priceDetails) => {
        if (!priceDetails) return 0;
        try {
            let details;
            if (typeof priceDetails === 'string') {
                details = JSON.parse(priceDetails);
            } else {
                details = priceDetails;
            }
            
            const prices = Array.isArray(details)
                ? details.map(d => parseFloat(d.price))
                : Object.values(details).map(p => parseFloat(p));
                
            if (prices.length === 0) return 0;
            return Math.min(...prices.filter(p => p > 0));
        } catch (e) {
            console.error('Gagal parse harga:', priceDetails, e);
            return 0;
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: 'Apakah Anda yakin ingin menghapus paket ini?',
            onConfirm: async () => {
                try {
                    await api.deleteItem('package', id);
                    api.refreshData('packages'); 
                    setConfirmModal({ ...confirmModal, isOpen: false });
                } catch (error) {
                    console.error('Gagal menghapus paket:', error);
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
        api.refreshData('packages');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Manajemen Paket Umroh</h1>
            
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Cari paket (nama, deskripsi)..."
                    className="px-4 py-2 border rounded-lg w-1/3"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button
                    onClick={() => setModal({ isOpen: true, data: null })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
                >
                    + Tambah Paket Baru
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Paket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Mulai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && (
                             <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <Loading />
                                </td>
                            </tr>
                        )}
                        {!loading && filteredData.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.duration}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold">
                                    {formatCurrency(getLowestPrice(item.price_details))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {item.start_date ? `${formatDate(item.start_date)} - ${formatDate(item.end_date)}` : 'Fleksibel'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.status === 'published' ? 'bg-green-100 text-green-800' :
                                        item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data paket yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {confirmModal.isOpen && (
                <Modal
                    title={confirmModal.title}
                    isOpen={confirmModal.isOpen} // PERBAIKAN: Prop `isOpen` diperlukan
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
                <Modal 
                    title={modal.data ? 'Edit Paket' : 'Tambah Paket Baru'} 
                    isOpen={modal.isOpen} // PERBAIKAN: Prop `isOpen` diperlukan
                    onClose={() => setModal({ isOpen: false, data: null })}
                >
                    <PackageForm data={modal.data} onClose={handleSuccess} />
                </Modal>
            )}
        </div>
    );
};

export default Packages;