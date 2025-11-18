import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { formatCurrency } from '../utils/helpers';
import JamaahForm from '../components/forms/JamaahForm';
import JamaahPaymentsModal from '../components/modals/JamaahPaymentsModal';
import { Button, Input, Select } from '../components/common/FormUI';
import { Modal } from '../components/common/Modal';
import { FaEdit, FaTrash, FaMoneyBillWave, FaPrint, FaUserPlus, FaPassport } from 'react-icons/fa';

const JamaahComponent = ({ openModal }) => {
    const { user } = useAuth(); // Gunakan user dari AuthContext (bukan ApiContext user)
    const { data, loading, error, createOrUpdate, deleteItem } = useApi();
    const { jamaah = [], packages = [] } = data || {}; 

    const [searchTerm, setSearchTerm] = useState('');
    const [filterPackage, setFilterPackage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [paymentsModalData, setPaymentsModalData] = useState(null);

    // Filter Client-Side (Bisa diubah ke Server-Side jika ApiContext mendukung search)
    const filteredJamaah = useMemo(() => {
        return jamaah.filter(item => {
            const nameMatch = item.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
            const idMatch = item.id_number?.includes(searchTerm);
            const matchesSearch = nameMatch || idMatch;
            const matchesPackage = filterPackage ? item.package_id == filterPackage : true;
            return matchesSearch && matchesPackage;
        });
    }, [jamaah, searchTerm, filterPackage]);

    const openFormModal = (item = null) => {
        openModal(
            item ? 'Edit Jamaah' : 'Tambah Jamaah',
            <JamaahForm
                initialData={item}
                packages={packages}
                onSave={async (formData) => {
                    await createOrUpdate('jamaah', formData, item ? item.id : null);
                }}
            />
        );
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await deleteItem('jamaah', itemToDelete.id);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handlePrint = (item) => {
        if (window.umh_wp_data?.printUrl) {
            window.open(`${window.umh_wp_data.printUrl}&jamaah_id=${item.id}`, '_blank');
        } else {
            alert('URL Print tidak ditemukan.');
        }
    };

    const getPackageName = (packageId) => {
        const pkg = packages.find(p => p.id == packageId);
        return pkg ? pkg.title : <span className="text-gray-400 italic">Paket Dihapus</span>;
    };

    if (loading && jamaah.length === 0) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Data Jemaah</h2>
                    <p className="text-sm text-gray-500">Total: {filteredJamaah.length} Jemaah</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Cari Nama / NIK..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="min-w-[250px]"
                    />
                    <Select
                        value={filterPackage}
                        onChange={(e) => setFilterPackage(e.target.value)}
                        className="min-w-[200px]"
                    >
                        <option value="">Semua Paket</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                        ))}
                    </Select>
                    <Button onClick={() => openFormModal()}>
                        <FaUserPlus className="mr-2" /> Tambah
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jemaah</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredJamaah.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    Tidak ada data jemaah yang sesuai filter.
                                </td>
                            </tr>
                        ) : (
                            filteredJamaah.map(item => {
                                const totalBill = parseFloat(item.total_price || 0);
                                const totalPaid = parseFloat(item.amount_paid || 0);
                                const remaining = totalBill - totalPaid;
                                const isPaidOff = remaining <= 0 && totalBill > 0;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                                    {item.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{item.full_name}</div>
                                                    <div className="text-xs text-gray-500">{item.passport_number || item.id_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {getPackageName(item.package_id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                item.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{formatCurrency(totalPaid)}</span>
                                                <span className={`text-xs ${isPaidOff ? 'text-green-600' : 'text-red-500'}`}>
                                                    {isPaidOff ? 'Lunas' : `Sisa: ${formatCurrency(remaining)}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button variant="icon" title="Pembayaran" onClick={() => setPaymentsModalData(item)}>
                                                <FaMoneyBillWave className="text-green-600" />
                                            </Button>
                                            <Button variant="icon" title="Cetak ID Card" onClick={() => handlePrint(item)}>
                                                <FaPrint className="text-gray-600" />
                                            </Button>
                                            <Button variant="icon" title="Edit" onClick={() => openFormModal(item)}>
                                                <FaEdit className="text-blue-600" />
                                            </Button>
                                            <Button variant="icon" title="Hapus" onClick={() => handleDelete(item)}>
                                                <FaTrash className="text-red-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Konfirmasi Hapus */}
            {isDeleteModalOpen && (
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Jemaah">
                    <div className="p-6">
                        <p className="text-gray-700 mb-6">
                            Apakah Anda yakin ingin menghapus data jemaah <strong>{itemToDelete?.full_name}</strong>?
                            <br/>
                            <span className="text-red-500 text-sm">Tindakan ini tidak dapat dibatalkan dan akan menghapus riwayat pembayaran terkait.</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
                            <Button variant="danger" onClick={confirmDelete}>Hapus Permanen</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal Pembayaran */}
            {paymentsModalData && (
                <JamaahPaymentsModal
                    jamaah={paymentsModalData}
                    onClose={() => setPaymentsModalData(null)}
                />
            )}
        </div>
    );
};

export default JamaahComponent;