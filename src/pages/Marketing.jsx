// Lokasi: src/pages/Marketing.jsx

import React, { useState, useMemo } from 'react';
// --- PERBAIKAN: Path import relatif ---
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import LeadForm from '../components/forms/LeadForm';
import { formatDate } from '../utils/helpers';
// --- AKHIR PERBAIKAN ---

const Marketing = () => {
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

    const usersMap = useMemo(() => {
        return (data.users || []).reduce((acc, user) => {
            acc[user.id] = user.full_name || user.user_email;
            return acc;
        }, {});
    }, [data.users]);

    const packagesMap = useMemo(() => {
        return (data.packages || []).reduce((acc, pkg) => {
            acc[pkg.id] = pkg.name;
            return acc;
        }, {});
    }, [data.packages]);

    const filteredData = useMemo(() => {
        return (data.marketing || []).filter(item =>
            item.full_name.toLowerCase().includes(filter.toLowerCase()) ||
            (item.phone_number && item.phone_number.toLowerCase().includes(filter.toLowerCase())) ||
            (item.email && item.email.toLowerCase().includes(filter.toLowerCase()))
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sortir terbaru dulu
    }, [data.marketing, filter]);

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: 'Apakah Anda yakin ingin menghapus lead ini?',
            onConfirm: async () => {
                try {
                    await api.deleteItem('marketing', id);
                    api.refreshData('marketing'); 
                    setConfirmModal({ ...confirmModal, isOpen: false });
                } catch (error) {
                    console.error('Gagal menghapus lead:', error);
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
        api.refreshData('marketing');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Manajemen Leads (Marketing)</h1>
            
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Cari leads (nama, telepon, email)..."
                    className="px-4 py-2 border rounded-lg w-1/3"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button
                    onClick={() => setModal({ isOpen: true, data: null })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
                >
                    + Tambah Lead Baru
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ditugaskan Ke</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket Diminati</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{item.phone_number}</div>
                                    <div className="text-sm text-gray-500">{item.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.source}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.status === 'converted' ? 'bg-green-100 text-green-800' :
                                        item.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                        item.status === 'lost' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{usersMap[item.assigned_to_user_id] || 'Belum ditugaskan'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{packagesMap[item.package_of_interest_id] || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data leads yang ditemukan.
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
                <Modal title={modal.data ? 'Edit Lead' : 'Tambah Lead Baru'} onClose={() => setModal({ isOpen: false, data: null })}>
                    <LeadForm data={modal.data} onSuccess={handleSuccess} />
                </Modal>
            )}
        </div>
    );
};

export default Marketing;