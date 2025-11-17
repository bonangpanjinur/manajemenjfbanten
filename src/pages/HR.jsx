import React, { useState, useMemo } from 'react';
// PERBAIKAN: Menambahkan ekstensi .jsx ke semua impor
import { useApi } from '../context/ApiContext.jsx';
import { LoadingScreen, LoadingSpinner } from '../components/common/Loading.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import { Modal } from '../components/common/Modal.jsx';
import UserForm from '../components/forms/UserForm.jsx';
import { Button, Input } from '../components/common/FormUI.jsx';
// AKHIR PERBAIKAN
import { Plus, Edit, Trash2, UserCheck, UserX, Filter } from 'lucide-react';

const HRComponent = () => {
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
        if (window.confirm('Apakah Anda yakin ingin menghapus data staff ini?')) {
            try {
                await deleteItem('hr', id);
            } catch (err) {
                alert('Gagal menghapus: ' + err.message);
            }
        }
    };

    const filteredData = useMemo(() => {
        return data.hr.filter(item =>
            item.full_name.toLowerCase().includes(filter.toLowerCase()) ||
            item.user_email.toLowerCase().includes(filter.toLowerCase()) ||
            item.role_name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [data.hr, filter]);

    if (loading && !data.hr.length) {
        // PERBAIKAN: Gunakan LoadingScreen
        return <LoadingScreen message="Memuat data HR..." />;
    }

    if (error) {
        return <ErrorMessage title="Gagal Memuat" message={error} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Staff (HR)</h1>
                <Button onClick={() => openModal()} className="mt-4 md:mt-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Staff
                </Button>
            </div>

            {/* Filter dan Tabel */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                    <Filter className="w-5 h-5 text-gray-500 mr-2" />
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan nama, email, atau role..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan="5" className="text-center p-4"><LoadingSpinner /></td>
                                </tr>
                            )}
                            {!loading && filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-gray-500">Data tidak ditemukan.</td>
                                </tr>
                            )}
                            {!loading && filteredData.map((item) => (
                                <tr key={item.ID}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.user_email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.role_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.status === 'active' ? <UserCheck className="w-4 h-4 mr-1" /> : <UserX className="w-4 h-4 mr-1" />}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button variant="icon" size="sm" onClick={() => openModal(item)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="icon" size="sm" color="danger" onClick={() => handleDelete(item.ID)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                // PERBAIKAN: Gunakan Modal
                <Modal title={selectedItem ? 'Edit Staff' : 'Tambah Staff'} onClose={closeModal}>
                    <div className="p-6">
                        <UserForm data={selectedItem} onClose={closeModal} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default HRComponent;