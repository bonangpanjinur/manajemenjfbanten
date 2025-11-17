import React, { useState, useMemo } from 'react';
// PERBAIKAN: Menambahkan ekstensi .jsx dan .js
import { useApi } from '../context/ApiContext.jsx';
import { LoadingScreen, LoadingSpinner } from '../components/common/Loading.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import { Modal } from '../components/common/Modal.jsx';
import JamaahForm from '../components/forms/JamaahForm.jsx';
import { Button, Input } from '../components/common/FormUI.jsx';
import { formatCurrency, formatDate } from '../utils/helpers.js';
// AKHIR PERBAIKAN
import { Plus, Edit, Trash2, DollarSign, FileText, Filter, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx'; // Dibutuhkan untuk printUrl

const JamaahComponent = ({ openModal }) => {
    const { data, loading, error, createOrUpdate, deleteItem } = useApi();
    const { printUrl } = useAuth(); // Ambil printUrl dari Auth
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('');

    const openFormModal = (item = null) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeFormModal = () => {
        setSelectedItem(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data jamaah ini?')) {
            try {
                await deleteItem('jamaah', id);
            } catch (err) {
                alert('Gagal menghapus: ' + err.message);
            }
        }
    };

    const handlePrint = (jamaahId) => {
        const url = `${printUrl}&jamaah_id=${jamaahId}`;
        window.open(url, '_blank');
    };

    const filteredData = useMemo(() => {
        return data.jamaah.filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase()) ||
            item.email.toLowerCase().includes(filter.toLowerCase()) ||
            item.phone.toLowerCase().includes(filter.toLowerCase()) ||
            (item.package_name && item.package_name.toLowerCase().includes(filter.toLowerCase()))
        );
    }, [data.jamaah, filter]);

    if (loading && !data.jamaah.length) {
        // PERBAIKAN: Gunakan LoadingScreen
        return <LoadingScreen message="Memuat data jamaah..." />;
    }

    if (error) {
        return <ErrorMessage title="Gagal Memuat" message={error} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Jamaah</h1>
                <Button onClick={() => openFormModal()} className="mt-4 md:mt-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Jamaah
                </Button>
            </div>

            {/* Filter dan Tabel */}
            <div className="bg-white p-6 rounded-lg shadow">
                 <div className="flex items-center mb-4">
                    <Filter className="w-5 h-5 text-gray-500 mr-2" />
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan nama, email, telepon, atau paket..."
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Bayar</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen</th>
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
                                const paymentStatus = item.payment_status || 'unpaid';
                                const statusInfo = {
                                    paid: { text: 'Lunas', color: 'bg-green-100 text-green-800' },
                                    down_payment: { text: 'DP', color: 'bg-blue-100 text-blue-800' },
                                    unpaid: { text: 'Belum Bayar', color: 'bg-red-100 text-red-800' },
                                    pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                                }[paymentStatus];

                                const docStatus = item.document_status === 'complete';
                                
                                return (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{item.email}</div>
                                            <div>{item.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.package_name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${docStatus ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {docStatus ? 'Lengkap' : 'Belum'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button title="Cetak Formulir" variant="icon" size="sm" onClick={() => handlePrint(item.id)}>
                                                <Printer className="w-4 h-4" />
                                            </Button>
                                            <Button title="Lihat Pembayaran" variant="icon" size="sm" onClick={() => openModal('jamaahPayments', { jamaah: item })}>
                                                <DollarSign className="w-4 h-4" />
                                            </Button>
                                            <Button title="Edit Jamaah" variant="icon" size="sm" onClick={() => openFormModal(item)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button title="Hapus Jamaah" variant="icon" size="sm" color="danger" onClick={() => handleDelete(item.id)}>
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
                <Modal title={selectedItem ? 'Edit Jamaah' : 'Tambah Jamaah'} onClose={closeFormModal}>
                    <div className="p-6">
                        <JamaahForm data={selectedItem} onClose={closeFormModal} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default JamaahComponent;