// Lokasi: src/pages/Jamaah.jsx

import React, { useState, useMemo } from 'react';
// --- PERBAIKAN: Path import relatif ---
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import JamaahForm from '../components/forms/JamaahForm';
import JamaahPaymentsModal from '../components/modals/JamaahPaymentsModal';
import { formatDate, formatCurrency } from '../utils/helpers';
// --- AKHIR PERBAIKAN ---

const Jamaah = () => {
    const api = useApi();
    const { data, loading, error } = api;
    const [filter, setFilter] = useState('');
    const [modal, setModal] = useState({ isOpen: false, data: null });
    const [paymentsModal, setPaymentsModal] = useState({ isOpen: false, jamaah: null });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;

    const filteredData = useMemo(() => {
        return (data.jamaah || []).filter(item =>
            item.full_name.toLowerCase().includes(filter.toLowerCase()) ||
            (item.passport_number && item.passport_number.toLowerCase().includes(filter.toLowerCase())) ||
            (item.phone_number && item.phone_number.toLowerCase().includes(filter.toLowerCase()))
        );
    }, [data.jamaah, filter]);

    const packagesMap = useMemo(() => {
        return (data.packages || []).reduce((acc, pkg) => {
            acc[pkg.id] = pkg;
            return acc;
        }, {});
    }, [data.packages]);

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: 'Apakah Anda yakin ingin menghapus data jemaah ini? Semua data terkait (pembayaran, dokumen) akan ikut terhapus.',
            onConfirm: async () => {
                try {
                    await api.deleteItem('jamaah', id);
                    api.refreshData('jamaah'); 
                    setConfirmModal({ ...confirmModal, isOpen: false }); 
                } catch (error) {
                    console.error('Gagal menghapus jemaah:', error);
                    setConfirmModal({ ...confirmModal, isOpen: false }); 
                }
            },
        });
    };

    const handleEdit = (item) => {
        setModal({ isOpen: true, data: item });
    };

    const handleOpenPayments = (item) => {
        setPaymentsModal({ isOpen: true, jamaah: item });
    };

    const handleSuccess = () => {
        setModal({ isOpen: false, data: null });
        api.refreshData('jamaah');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Manajemen Jemaah</h1>
            
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Cari jemaah (nama, paspor, telepon)..."
                    className="px-4 py-2 border rounded-lg w-1/3"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button
                    onClick={() => setModal({ isOpen: true, data: null })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
                >
                    + Tambah Jemaah Baru
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{item.full_name}</div>
                                    <div className="text-sm text-gray-500">{item.passport_number || 'No Paspor'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{item.phone_number}</div>
                                    <div className="text-sm text-gray-500">{item.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {packagesMap[item.package_id]?.name || 'Belum ada paket'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-green-700">{formatCurrency(item.total_payment || 0)}</div>
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                        item.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {item.payment_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleOpenPayments(item)} className="text-green-600 hover:text-green-900">Bayar</button>
                                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data jemaah yang ditemukan.
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
                <Modal title={modal.data ? 'Edit Jemaah' : 'Tambah Jemaah Baru'} onClose={() => setModal({ isOpen: false, data: null })}>
                    <JamaahForm data={modal.data} onSuccess={handleSuccess} />
                </Modal>
            )}

            {paymentsModal.isOpen && (
                <JamaahPaymentsModal 
                    jamaah={paymentsModal.jamaah} 
                    packageDetails={packagesMap[paymentsModal.jamaah.package_id]}
                    onClose={() => setPaymentsModal({ isOpen: false, jamaah: null })} 
                />
            )}
        </div>
    );
};

export default Jamaah;