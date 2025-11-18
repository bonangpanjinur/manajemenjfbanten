// Lokasi: src/pages/SubAgents.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import SubAgentForm from '../components/forms/SubAgentForm.jsx';
import { Button, Input } from '../components/common/FormUI.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { FaEdit, FaTrash, FaUserTie } from 'react-icons/fa';

const SubAgentsComponent = ({ openModal }) => {
    const { user } = useAuth();
    const { data, loading, error, createOrUpdate, deleteItem } = useApi();
    const { sub_agents } = data || { sub_agents: [] };

    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openFormModal = (item = null) => {
        openModal(
            item ? 'Edit Sub Agen' : 'Tambah Sub Agen',
            <SubAgentForm
                initialData={item}
                onSave={(formData) => {
                    createOrUpdate('sub_agents', formData, item ? item.id : null);
                }}
            />
        );
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteItem('sub_agents', itemToDelete.id);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const filteredSubAgents = useMemo(() => {
        return (sub_agents || []).filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.address && item.address.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [sub_agents, searchTerm]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.message} />;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Manajemen Sub Agen</h2>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <Input
                    type="text"
                    placeholder="Cari nama atau alamat sub agen..."
                    className="w-full md:w-2/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                    variant="primary"
                    onClick={() => openFormModal()}
                    className="w-full md:w-auto"
                >
                    <FaUserTie className="mr-2" />
                    Tambah Sub Agen
                </Button>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSubAgents.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.address || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div className="flex gap-2">
                                        <Button variant="warning" size="sm" onClick={() => openFormModal(item)} title="Edit">
                                            <FaEdit />
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(item)} title="Hapus">
                                            <FaTrash />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSubAgents.length === 0 && (
                    <p className="text-center p-4 text-gray-500">Data tidak ditemukan.</p>
                )}
            </div>

            {/* Modal Konfirmasi Hapus */}
            {isDeleteModalOpen && (
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Konfirmasi Hapus">
                    <div className="p-4">
                        <p className="text-gray-700">Anda yakin ingin menghapus data sub agen: <strong>{itemToDelete?.name}</strong>?</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
                            <Button variant="danger" onClick={confirmDelete}>Ya, Hapus</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SubAgentsComponent;