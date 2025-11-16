import React, { useState, useMemo } from 'react';
import { useApi } from '../context/ApiContext'; // .jsx dihapus
import JamaahForm from '../components/forms/JamaahForm'; // .jsx dihapus
import { Modal } from '../components/common/Modal'; // .jsx dihapus
import { LoadingSpinner } from '../components/common/Loading'; // .jsx dihapus
import { ErrorMessage } from '../components/common/ErrorMessage'; // .jsx dihapus
import { Button, Input, Select, FormLabel } from '../components/common/FormUI'; // .jsx dihapus
import { formatCurrency, getStatusBadge, formatDate } from '../utils/helpers'; // .js dihapus (dan formatDate ditambahkan)
import { User as UserIcon, CreditCard, Edit2, Trash2, Search } from 'lucide-react';

// -- STYLING HELPER (PENGGANTI clsx) --
const cn = (...classes) => classes.filter(Boolean).join(' ');

const JamaahComponent = ({ onOpenPayments }) => {
    const { jamaah, packages, saveJamaah, deleteJamaah, loading, error } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJamaah, setSelectedJamaah] = useState(null);
    const [filterPackage, setFilterPackage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (j = null) => {
        setSelectedJamaah(j);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedJamaah(null);
    };

    const handleSave = async (j) => {
        try {
            await saveJamaah(j);
            handleCloseModal();
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm && window.confirm('Yakin ingin menghapus jemaah ini? Semua data pembayaran terkait akan ikut terhapus.')) {
            try {
                await deleteJamaah(id);
            } catch (e) {
                alert(`Error: ${e.message}`);
            }
        }
    };

    const getDocumentStatus = (j) => {
        let count = 0;
        if (j.is_passport_verified) count++;
        if (j.is_ktp_verified) count++;
        if (j.is_kk_verified) count++;
        if (j.is_meningitis_verified) count++;
        if (count === 4) return getStatusBadge('Lengkap');
        if (count > 0) return getStatusBadge(`${count}/4`);
        return getStatusBadge('Belum');
    };

    const filteredJamaah = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return jamaah.filter(j => 
            (!filterPackage || j.package_id == filterPackage) &&
            (!s || 
                j.full_name?.toLowerCase().includes(s) ||
                j.id_number?.toLowerCase().includes(s) ||
                j.phone?.toLowerCase().includes(s) ||
                j.email?.toLowerCase().includes(s)
            )
        );
    }, [jamaah, filterPackage, searchTerm]);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 relative min-h-[300px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Manajemen Jemaah</h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <UserIcon size={18} /> Tambah Jemaah
                </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full md:w-auto">
                    <FormLabel htmlFor="search-jemaah">Cari Jemaah</FormLabel>
                    <div className="relative">
                        <Input 
                            id="search-jemaah" 
                            type="text" 
                            placeholder="Nama, NIK, HP, Email..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <FormLabel htmlFor="filter-paket">Filter Paket</FormLabel>
                    <Select id="filter-paket" value={filterPackage} onChange={e => setFilterPackage(e.target.value)}>
                        <option value="">Semua Paket</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.title} ({pkg.departure_date ? formatDate(pkg.departure_date) : 'N/A'})</option>
                        ))}
                    </Select>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Bayar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Tagihan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perlengkapan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredJamaah.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">Tidak ada jemaah yang cocok.</td>
                                </tr>
                            )}
                            {filteredJamaah.map(j => {
                                const sisa = (j.total_price || 0) - (j.amount_paid || 0);
                                const pkg = packages.find(p => p.id == j.package_id);
                                return (
                                    <tr key={j.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{j.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg?.title || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(j.payment_status)}</td>
                                        <td className={cn(
                                            "px-6 py-4 whitespace-nowrap text-sm font-medium",
                                            sisa > 0 ? 'text-red-600' : 'text-green-600'
                                        )}>
                                            {formatCurrency(sisa)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getDocumentStatus(j)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(j.equipment_status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{j.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                            <Button variant="primary" size="sm" onClick={() => onOpenPayments(j)}>
                                                <CreditCard size={14} /> Bayar
                                            </Button>
                                            <Button variant="icon" size="sm" onClick={() => handleOpenModal(j)} title="Edit Jemaah">
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button variant="icon" size="sm" className="text-red-600 hover:bg-red-100" onClick={() => handleDelete(j.id)} title="Hapus Jemaah">
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                title={selectedJamaah ? 'Edit Jemaah' : 'Tambah Jemaah Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                size="4xl"
            >
                <JamaahForm
                    initialData={selectedJamaah}
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                    packages={packages}
                />
            </Modal>
        </div>
    );
};

export default JamaahComponent;