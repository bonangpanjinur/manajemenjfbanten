import React, { useState, useMemo } from 'react';
// PERBAIKAN: Menambahkan ekstensi .jsx dan .js
import { useApi } from '../context/ApiContext.jsx';
import { LoadingScreen, LoadingSpinner } from '../components/common/Loading.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import { Modal } from '../components/common/Modal.jsx';
import LeadForm from '../components/forms/LeadForm.jsx';
import { Button, Input } from '../components/common/FormUI.jsx';
import { formatDate } from '../utils/helpers.js';
// AKHIR PERBAIKAN
import { Plus, Edit, Trash2, Phone, Mail, MessageSquare, Filter } from 'lucide-react';

const MarketingComponent = () => {
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
        if (window.confirm('Apakah Anda yakin ingin menghapus data lead ini?')) {
            try {
                await deleteItem('marketing', id); // 'marketing' adalah key untuk leads
            } catch (err) {
                alert('Gagal menghapus: ' + err.message);
            }
        }
    };

    const filteredData = useMemo(() => {
        return data.marketing.filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase()) ||
            item.email.toLowerCase().includes(filter.toLowerCase()) ||
            item.phone.toLowerCase().includes(filter.toLowerCase()) ||
            item.status.toLowerCase().includes(filter.toLowerCase())
        );
    }, [data.marketing, filter]);

    if (loading && !data.marketing.length) {
        // PERBAIKAN: Gunakan LoadingScreen
        return <LoadingScreen message="Memuat data marketing..." />;
    }

    if (error) {
        return <ErrorMessage title="Gagal Memuat" message={error} />;
    }

    const getStatusInfo = (status) => {
        switch (status) {
            case 'new': return { text: 'Baru', color: 'bg-blue-100 text-blue-800' };
            case 'contacted': return { text: 'Dihubungi', color: 'bg-yellow-100 text-yellow-800' };
            case 'qualified': return { text: 'Kualifikasi', color: 'bg-indigo-100 text-indigo-800' };
            case 'lost': return { text: 'Gagal', color: 'bg-red-100 text-red-800' };
            case 'converted': return { text: 'Konversi', color: 'bg-green-100 text-green-800' };
            default: return { text: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Leads</h1>
                <Button onClick={() => openModal()} className="mt-4 md:mt-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Lead
                </Button>
            </div>

            {/* Filter dan Tabel */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                    <Filter className="w-5 h-5 text-gray-500 mr-2" />
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan nama, email, telepon, atau status..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
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
                                const statusInfo = getStatusInfo(item.status);
                                return (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.email && <div><Mail className="w-4 h-4 inline mr-1" /> {item.email}</div>}
                                            {item.phone && <div><Phone className="w-4 h-4 inline mr-1" /> {item.phone}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.source}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
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
                <Modal title={selectedItem ? 'Edit Lead' : 'Tambah Lead'} onClose={closeModal}>
                    <div className="p-6">
                        <LeadForm data={selectedItem} onClose={closeModal} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default MarketingComponent;