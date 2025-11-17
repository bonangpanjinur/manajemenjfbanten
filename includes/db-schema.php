import React, { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useApi } from '../context/ApiContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import JamaahForm from '../components/forms/JamaahForm.jsx';
import JamaahPaymentsModal from '../components/modals/JamaahPaymentsModal.jsx';

// --- PERBAIKAN IMPORT (Sesuai Peringatan Build) ---
import { Modal } from '../components/common/Modal.jsx';
import { LoadingSpinner as Loading } from '../components/common/Loading.jsx'; 
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
// --- AKHIR PERBAIKAN ---

import { 
    PencilSquareIcon, 
    TrashIcon, 
    EyeIcon, 
    UserPlusIcon, 
    CurrencyDollarIcon, 
    PrinterIcon 
} from '@heroicons/react/24/outline';
import { 
    ArrowUpIcon, 
    ArrowDownIcon, 
    MagnifyingGlassIcon, 
    FunnelIcon, 
    ChevronDownIcon, 
    ChevronUpIcon,
    XMarkIcon
} from '@heroicons/react/20/solid';

// Helper function to format currency
const formatCurrency = (value) => {
    if (!value) return "Rp 0";
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        return format(date, "d MMM yyyy", { locale: id });
    } catch (e) {
        // Fallback for non-ISO strings, though data should be ISO
        try {
            return format(new Date(dateString), "d MMM yyyy", { locale: id });
        } catch (e2) {
            return dateString;
        }
    }
};

const Jamaah = () => {
    const { data, loading, error, createOrUpdate, deleteItem, refreshData } = useApi();
    const { auth } = useAuth(); // Menggunakan 'auth' dari context
    const { printUrl, adminUrl } = auth; // Ambil printUrl dari auth
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
    const [selectedJamaah, setSelectedJamaah] = useState(null);
    const [jamaahToDelete, setJamaahToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'registration_date', direction: 'descending' });
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPackage, setFilterPackage] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Ambil data dari context
    const { jamaah, packages, departures } = data;

    // Loading & Error handling
    if (loading && !jamaah.length) {
        return <div className="flex justify-center items-center h-64"><Loading /></div>;
    }

    if (error) {
        return <ErrorMessage message={`Gagal memuat data jemaah: ${error}`} onRetry={refreshData} />;
    }

    // Map data untuk tampilan tabel
    const mappedJamaah = jamaah.map(j => {
        const pkg = packages.find(p => p.id === j.package_id);
        const departure = departures.find(d => d.id === j.departure_id);
        return {
            ...j,
            packageName: pkg ? pkg.name : "N/A",
            departureDate: departure ? departure.departure_date : "N/A",
        };
    });

    // Filtering logic
    const filteredJamaah = mappedJamaah.filter(j => {
        // Filter by search term (name, id_number, passport_number, phone_number)
        const searchMatch =
            j.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (j.id_number && j.id_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (j.passport_number && j.passport_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (j.phone_number && j.phone_number.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filter by status
        const statusMatch = filterStatus === 'all' || j.status === filterStatus;

        // Filter by package
        const packageMatch = filterPackage === 'all' || j.package_id === parseInt(filterPackage);

        return searchMatch && statusMatch && packageMatch;
    });

    // Sorting logic
    const sortedJamaah = [...filteredJamaah].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric sorting for total_payment
        if (sortConfig.key === 'total_payment') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    // Sorting request handler
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Modal handlers
    const openModal = (jamaah = null) => {
        setSelectedJamaah(jamaah);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedJamaah(null);
    };

    const openDeleteModal = (jamaah) => {
        setJamaahToDelete(jamaah);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setJamaahToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const openPaymentsModal = (jamaah) => {
        setSelectedJamaah(jamaah);
        setIsPaymentsModalOpen(true);
    };

    const closePaymentsModal = () => {
        setSelectedJamaah(null);
        setIsPaymentsModalOpen(false);
    };

    // Data action handlers
    const handleSave = async (formData) => {
        await createOrUpdate('jamaah', formData);
        closeModal();
    };

    const handleDelete = async () => {
        if (jamaahToDelete) {
            await deleteItem('jamaah', jamaahToDelete.id);
            closeDeleteModal();
        }
    };

    // Print handler
    const handlePrint = (jamaahId) => {
        if (printUrl) {
            const url = `${printUrl}&jamaah_id=${jamaahId}`;
            window.open(url, '_blank');
        } else {
            console.error("Print URL not configured");
        }
    };

    // Get unique status values for filter
    const statusOptions = [...new Set(mappedJamaah.map(j => j.status))];

    // Table header sort component
    const SortableHeader = ({ label, sortKey }) => {
        const isActive = sortConfig.key === sortKey;
        const Icon = isActive ? (sortConfig.direction === 'ascending' ? ArrowUpIcon : ArrowDownIcon) : ChevronUpIcon;
        return (
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => requestSort(sortKey)}>
                <span className="flex items-center">
                    {label}
                    <Icon className={`w-4 h-4 ml-1 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                </span>
            </th>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Manajemen Jemaah</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Kelola data jemaah, pendaftaran, pembayaran, dan dokumen.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => openModal()}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Tambah Jemaah
                    </button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        name="search-jamaah"
                        id="search-jamaah"
                        className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Cari jemaah..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 md:ml-4">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
                        Filter
                        {isFilterOpen ? <ChevronUpIcon className="h-5 w-5 ml-2 -mr-1" /> : <ChevronDownIcon className="h-5 w-5 ml-2 -mr-1" />}
                    </button>
                </div>
            </div>

            {/* Filter Dropdown */}
            {isFilterOpen && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700">
                                Status Jemaah
                            </label>
                            <select
                                id="filter-status"
                                name="filter-status"
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Semua Status</option>
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filter-package" className="block text-sm font-medium text-gray-700">
                                Paket
                            </label>
                            <select
                                id="filter-package"
                                name="filter-package"
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                value={filterPackage}
                                onChange={(e) => setFilterPackage(e.target.value)}
                            >
                                <option value="all">Semua Paket</option>
                                {packages.map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>
                                        {pkg.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => { setFilterStatus('all'); setFilterPackage('all'); setIsFilterOpen(false); }}
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Bersihkan Filter
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <SortableHeader label="Nama Lengkap" sortKey="full_name" />
                                        <SortableHeader label="Paket" sortKey="packageName" />
                                        <SortableHeader label="Tgl. Daftar" sortKey="registration_date" />
                                        <SortableHeader label="Total Bayar" sortKey="total_payment" />
                                        <SortableHeader label="Status Bayar" sortKey="payment_status" />
                                        <SortableHeader label="Status Jemaah" sortKey="status" />
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Aksi</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {sortedJamaah.length > 0 ? (
                                        sortedJamaah.map((jamaah) => (
                                            <tr key={jamaah.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="font-medium text-gray-900">{jamaah.full_name}</div>
                                                    <div className="text-gray-500">{jamaah.phone_number}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <div className="text-gray-900">{jamaah.packageName}</div>
                                                    <div className="text-gray-500">{formatDate(jamaah.departureDate)}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {formatDate(jamaah.registration_date)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {formatCurrency(jamaah.total_payment)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        jamaah.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        jamaah.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {jamaah.payment_status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                     <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        jamaah.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                        jamaah.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800' // pending
                                                    }`}>
                                                        {jamaah.status}
                                                    </span>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => openPaymentsModal(jamaah)}
                                                            title="Lihat Pembayaran"
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            <CurrencyDollarIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePrint(jamaah.id)}
                                                            title="Cetak Formulir"
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <PrinterIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(jamaah)}
                                                            title="Edit Jemaah"
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <PencilSquareIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(jamaah)}
                                                            title="Hapus Jemaah"
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10 text-gray-500">
                                                {loading ? <Loading /> : 'Tidak ada data jemaah yang ditemukan.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                title={selectedJamaah ? 'Edit Data Jemaah' : 'Tambah Jemaah Baru'}
                isOpen={isModalOpen}
                onClose={closeModal}
            >
                <JamaahForm
                    jamaah={selectedJamaah}
                    onSave={handleSave}
                    onCancel={closeModal}
                    packages={packages}
                    departures={departures}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Hapus Jemaah"
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
            >
                <div>
                    <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus data jemaah ini?
                    </p>
                    <p className="font-medium text-gray-800 mt-1">
                        {jamaahToDelete?.full_name}
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                        Tindakan ini tidak dapat dibatalkan. Semua data terkait (seperti pembayaran) akan tetap ada, tetapi tidak lagi terhubung.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={closeDeleteModal}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={handleDelete}
                        >
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </Modal>
            
            {/* Payments Modal */}
            {selectedJamaah && (
                <JamaahPaymentsModal
                    isOpen={isPaymentsModalOpen}
                    onClose={closePaymentsModal}
                    jamaah={selectedJamaah}
                    onUpdate={refreshData} // Full refresh on payment update
                />
            )}
        </div>
    );
};

export default Jamaah;