// Lokasi: src/pages/HR.jsx

import React, { useState, useMemo } from 'react';
// --- PERBAIKAN: Path import relatif ---
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import UserForm from '../components/forms/UserForm';
import { formatDate, formatCurrency } from '../utils/helpers';
// --- AKHIR PERBAIKAN ---

const HR = () => {
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

    const combinedUserData = useMemo(() => {
        const hrMap = (data.hr || []).reduce((acc, hr) => {
            acc[hr.user_id] = hr;
            return acc;
        }, {});

        return (data.users || []).map(user => {
            const hrData = hrMap[user.id] || {};
            return {
                ...user, 
                ...hrData, 
                id: user.id,
                user_id: user.id, 
            };
        });
    }, [data.users, data.hr]);

    const filteredData = useMemo(() => {
        return combinedUserData.filter(item =>
            (item.full_name && item.full_name.toLowerCase().includes(filter.toLowerCase())) ||
            (item.user_email && item.user_email.toLowerCase().includes(filter.toLowerCase())) ||
            (item.position && item.position.toLowerCase().includes(filter.toLowerCase()))
        );
    }, [combinedUserData, filter]);

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: 'Apakah Anda yakin ingin menghapus pengguna ini? (Data HR terkait juga akan dihapus)',
            onConfirm: async () => {
                try {
                    await api.deleteItem('user', id); 
                    api.refreshData('users');
                    api.refreshData('hr');
                    setConfirmModal({ ...confirmModal, isOpen: false });
                } catch (error) {
                    console.error('Gagal menghapus pengguna:', error);
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
        api.refreshData('users');
        api.refreshData('hr');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Manajemen Karyawan (HR)</h1>
            
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Cari karyawan (nama, email, posisi)..."
                    className="px-4 py-2 border rounded-lg w-1/3"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button
                    onClick={() => setModal({ isOpen: true, data: null })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
                >
                    + Tambah Karyawan Baru
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role (Divisi)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Bergabung</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.full_name || '(Belum diatur)'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.user_email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.role || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.position || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.join_date ? formatDate(item.join_date) : 'N/A'}</td>
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
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data karyawan yang ditemukan.
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
                <Modal title={modal.data ? 'Edit Karyawan' : 'Tambah Karyawan Baru'} onClose={() => setModal({ isOpen: false, data: null })}>
                    <UserForm data={modal.data} onSuccess={handleSuccess} />
                </Modal>
            )}
        </div>
    );
};

export default HR;