import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import { LoadingSpinner } from '../components/common/Loading.jsx';
// PERBAIKAN: Mengganti import default 'ErrorMessage' menjadi named import '{ ErrorMessage }'
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
// PERBAIKAN: Menghapus 'getPackagePrice' dari import helpers
import { formatCurrency } from '../utils/helpers';
import JamaahForm from '../components/forms/JamaahForm.jsx';
import JamaahPaymentsModal from '../components/modals/JamaahPaymentsModal.jsx';
// PERBAIKAN: Menghapus komponen Tabel (Table, Thead, dll.) yang tidak ada di FormUI
import { Button, Input, Select } from '../components/common/FormUI.jsx';
// PERBAIKAN: Mengganti import default 'Modal' menjadi named import '{ Modal }'
import { Modal } from '../components/common/Modal.jsx';
import { FaEdit, FaTrash, FaMoneyBillWave, FaPrint, FaUserPlus } from 'react-icons/fa';

// PERBAIKAN: Menambahkan fungsi getPackagePrice secara lokal
// Fungsi ini tidak ditemukan di helpers.js, jadi kita definisikan di sini
// berdasarkan struktur data di PackageForm.jsx
const getPackagePrice = (pkg, room_type) => {
    if (!pkg) return 0;
    if (room_type === 'quad') return parseFloat(pkg.price_quad || 0);
    if (room_type === 'triple') return parseFloat(pkg.price_triple || 0);
    if (room_type === 'double') return parseFloat(pkg.price_double || 0);
    return 0; // Default case
};


const JamaahComponent = ({ openModal }) => {
    const { user } = useAuth();
    const { data, loading, error, createOrUpdate, deleteItem } = useApi();
    // PERBAIKAN: Menghapus underscore '_' yang salah ketik setelah destructuring
    const { jamaah, packages } = data || { jamaah: [], packages: [] }; // Fallback

    const [searchTerm, setSearchTerm] = useState('');
    const [filterPackage, setFilterPackage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [paymentsModalData, setPaymentsModalData] = useState(null);

    const openFormModal = (item = null) => {
        openModal(
            item ? 'Edit Jamaah' : 'Tambah Jamaah',
            <JamaahForm
                initialData={item}
                packages={packages || []}
                onSave={(formData) => {
                    createOrUpdate('jamaah', formData, item ? item.id : null);
                }}
            />
        );
    };

    const openPaymentsModal = (item) => {
        setPaymentsModalData(item);
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteItem('jamaah', itemToDelete.id);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handlePrint = (item) => {
        // Pastikan 'umh.printUrl' tersedia di scope window
        if (window.umh && window.umh.printUrl) {
            window.open(window.umh.printUrl + '&jamaah_id=' + item.id, '_blank');
        } else {
            console.error('Print URL (window.umh.printUrl) not defined.');
        }
    };

    const filteredJamaah = useMemo(() => {
        return (jamaah || []).filter(item => {
            const matchesSearch = item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.ktp_number && item.ktp_number.includes(searchTerm)); // Menambahkan pengecekan null/undefined
            const matchesPackage = filterPackage ? item.package_id === filterPackage : true;
            return matchesSearch && matchesPackage;
        });
    }, [jamaah, searchTerm, filterPackage]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.message} />;

    const getPackageName = (packageId) => {
        const pkg = (packages || []).find(p => p.id === packageId);
        return pkg ? pkg.package_name : 'N/A';
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Manajemen Jamaah</h2>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <Input
                    type="text"
                    placeholder="Cari nama atau no. KTP jamaah..."
                    className="w-full md:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                    className="w-full md:w-1/3"
                    value={filterPackage}
                    onChange={(e) => setFilterPackage(e.target.value)}
                >
                    <option value="">Semua Paket</option>
                    {(packages || []).map(pkg => (
                        <option key={pkg.id} value={pkg.id}>{pkg.package_name}</option>
                    ))}
                </Select>
                <Button
                    variant="primary"
                    onClick={() => openFormModal()}
                    className="w-full md:w-auto"
                >
                    <FaUserPlus className="mr-2" />
                    Tambah Jamaah
                </Button>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                {/* PERBAIKAN: Mengganti <Table> dengan <table> dan menambahkan class Tailwind */}
                <table className="min-w-full divide-y divide-gray-200">
                    {/* PERBAIKAN: Mengganti <Thead> dengan <thead> */}
                    <thead className="bg-gray-50">
                        {/* PERBAIKAN: Mengganti <Tr> dengan <tr> */}
                        <tr>
                            {/* PERBAIKAN: Mengganti <Th> dengan <th> dan menambahkan class Tailwind */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Paket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bayar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Tagihan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    {/* PERBAIKAN: Mengganti <Tbody> dengan <tbody> */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredJamaah.map(item => {
                            const pkg = (packages || []).find(p => p.id === item.package_id);
                            // PERBAIKAN: Memanggil fungsi getPackagePrice lokal (hanya room_type)
                            const price = getPackagePrice(pkg, item.room_type);
                            const totalPaid = parseFloat(item.total_payments || 0);
                            const remaining = price - totalPaid;

                            return (
                                // PERBAIKAN: Mengganti <Tr> dengan <tr>
                                <tr key={item.id}>
                                    {/* PERBAIKAN: Mengganti <Td> dengan <td> dan menambahkan class Tailwind */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getPackageName(item.package_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(totalPaid)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(remaining)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${remaining <= 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {remaining <= 0 ? 'Lunas' : 'Belum Lunas'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => openPaymentsModal(item)} title="Lihat Pembayaran">
                                                <FaMoneyBillWave />
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => handlePrint(item)} title="Cetak Kartu">
                                                <FaPrint />
                                            </Button>
                                            <Button variant="warning" size="sm" onClick={() => openFormModal(item)} title="Edit Jamaah">
                                                <FaEdit />
                                            </Button>
                                            {user && user.role === 'admin' && (
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(item)} title="Hapus Jamaah">
                                                    <FaTrash />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredJamaah.length === 0 && (
                    <p className="text-center p-4 text-gray-500">Data tidak ditemukan.</p>
                )}
            </div>

            {/* Modal Konfirmasi Hapus */}
            {isDeleteModalOpen && (
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Konfirmasi Hapus">
                    <div className="p-4">
                        <p className="text-gray-700">Anda yakin ingin menghapus data jamaah: <strong>{itemToDelete?.full_name}</strong>?</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
                            <Button variant="danger" onClick={confirmDelete}>Ya, Hapus</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal Pembayaran */}
            {paymentsModalData && (
                <JamaahPaymentsModal
                    isOpen={!!paymentsModalData}
                    onClose={() => setPaymentsModalData(null)}
                    jamaahData={paymentsModalData}
                    packagePrice={getPackagePrice(
                        (packages || []).find(p => p.id === paymentsModalData.package_id),
                        paymentsModalData.room_type
                    )}
                    createOrUpdate={createOrUpdate}
                    deleteItem={deleteItem}
                />
            )}
        </div>
    );
};

export default JamaahComponent;