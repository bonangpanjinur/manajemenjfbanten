import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import UserForm from '../components/forms/UserForm';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Button } from '../components/common/FormUI';
import { getStatusBadge } from '../utils/helpers';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const HRComponent = () => {
    const { users, saveUser, deleteUser, loading, error } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleOpenModal = (user = null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSave = async (user) => {
        try {
            await saveUser(user);
            handleCloseModal();
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm && window.confirm('Yakin ingin menghapus karyawan ini?')) {
            try {
                await deleteUser(id);
            } catch (e) {
                alert(`Error: ${e.message}`);
            }
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 relative min-h-[300px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Manajemen Karyawan</h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Tambah Karyawan
                </Button>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran (Role)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Tidak ada data karyawan.</td>
                                </tr>
                            )}
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                        <Button variant="icon" size="sm" onClick={() => handleOpenModal(user)} title="Edit Karyawan">
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="icon" size="sm" className="text-red-600 hover:bg-red-100" onClick={() => handleDelete(user.id)} title="Hapus Karyawan">
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                title={selectedUser ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                size="3xl"
            >
                <UserForm
                    initialData={selectedUser}
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default HRComponent;