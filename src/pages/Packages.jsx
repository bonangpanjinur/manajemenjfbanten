import React, { useState } from 'react';
import { useApi } from '../context/ApiContext'; // .jsx dihapus
import PackageForm from '../components/forms/PackageForm'; // .jsx dihapus
import { Modal } from '../components/common/Modal'; // .jsx dihapus
import { LoadingSpinner } from '../components/common/Loading'; // .jsx dihapus
import { ErrorMessage } from '../components/common/ErrorMessage'; // .jsx dihapus
import { Button } from '../components/common/FormUI'; // .jsx dihapus
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers'; // .js dihapus
import { Plus, Edit2, Trash2 } from 'lucide-react';

const PackagesComponent = () => {
    const { packages, savePackage, deletePackage, loading, error } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const handleOpenModal = (pkg = null) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPackage(null);
    };

    const handleSave = async (pkg) => {
        try {
            await savePackage(pkg);
            handleCloseModal();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm && window.confirm('Yakin ingin menghapus paket ini?')) {
            try {
                await deletePackage(id);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };
    
    const getLowestPrice = (priceDetailsJson) => {
        if (!priceDetailsJson) return 0;
        try {
            const prices = JSON.parse(priceDetailsJson);
            // Cari harga valid terendah
            const validPrices = [prices.quad, prices.triple, prices.double].filter(p => p && parseFloat(p) > 0);
            if (validPrices.length === 0) return 0;
            return Math.min(...validPrices.map(p => parseFloat(p)));
        } catch(e) {
            return 0;
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 relative min-h-[300px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Manajemen Paket</h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Tambah Paket
                </Button>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Paket</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Berangkat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kota</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Mulai</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {packages.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">Tidak ada paket.</td>
                                </tr>
                            )}
                            {packages.map(pkg => (
                                <tr key={pkg.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(pkg.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(pkg.departure_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg.duration} Hari</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg.departure_city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(getLowestPrice(pkg.price_details))}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg.slots_filled || 0} / {pkg.slots_available || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button variant="icon" size="sm" onClick={() => handleOpenModal(pkg)} title="Edit Paket">
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="icon" size="sm" className="text-red-600 hover:bg-red-100" onClick={() => handleDelete(pkg.id)} title="Hapus Paket">
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
                title={selectedPackage ? 'Edit Paket' : 'Tambah Paket Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                size="4xl"
            >
                <PackageForm
                    initialData={selectedPackage}
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default PackagesComponent;