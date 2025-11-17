import React, { useState, useMemo } from 'react';
// PERBAIKAN: Menambahkan ekstensi .jsx untuk import konteks dan komponen
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../context/ApiContext.jsx';
import Modal from '../components/common/Modal.jsx';
import JamaahForm from '../components/forms/JamaahForm.jsx';
import JamaahPaymentsModal from '../components/modals/JamaahPaymentsModal.jsx';
import Loading from '../components/common/Loading.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
// File .js tidak perlu diubah
import { formatCurrency, formatDate } from '../utils/helpers.js';
import { tableStyle, thStyle, tdStyle, buttonStyle, inputStyle, selectStyle } from '../style.js';

// Komponen utama untuk halaman Jamaah
const JamaahComponent = ({ jamaah, packages, loading, error, createOrUpdate, deleteItem }) => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedJamaahForPayment, setSelectedJamaahForPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPackage, setFilterPackage] = useState('');
    const [filterPayment, setFilterPayment] = useState('');

    const canCreate = user.roles.includes('owner') || user.roles.includes('admin_staff');
    const canEdit = user.roles.includes('owner') || user.roles.includes('admin_staff');
    const canDelete = user.roles.includes('owner');
    const canManagePayments = user.roles.includes('owner') || user.roles.includes('admin_staff') || user.roles.includes('finance_staff');

    // Memo-kan data yang difilter untuk performa
    const filteredJamaah = useMemo(() => {
        if (!jamaah) return [];
        return jamaah.filter(j => {
            const matchesSearch = j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                j.ktp_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                j.passport_no?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesPackage = filterPackage ? j.package_id == filterPackage : true;
            const matchesPayment = filterPayment ? j.payment_status === filterPayment : true;

            return matchesSearch && matchesPackage && matchesPayment;
        });
    }, [jamaah, searchTerm, filterPackage, filterPayment]);

    // Handler untuk membuka form modal
    const openFormModal = (item = null) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // Handler untuk menutup form modal
    const closeFormModal = () => {
        setSelectedItem(null);
        setIsModalOpen(false);
    };

    // Handler untuk membuka modal pembayaran
    const openPaymentModal = (jamaah) => {
        setSelectedJamaahForPayment(jamaah);
        setIsPaymentModalOpen(true);
    };

    // Handler untuk menutup modal pembayaran
    const closePaymentModal = () => {
        setSelectedJamaahForPayment(null);
        setIsPaymentModalOpen(false);
    };

    // Handler untuk submit form (Create/Update)
    const handleFormSubmit = async (data) => {
        await createOrUpdate('jamaah', data);
        closeFormModal();
    };

    // Handler untuk hapus item
    const handleDelete = async (id) => {
        // Ganti dengan UI konfirmasi kustom
        if (true) { // Ganti `true` dengan logika konfirmasi modal
            await deleteItem('jamaah', id);
        }
    };

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Jamaah</h1>

            {/* Kontrol Filter dan Tambah Data */}
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                <input
                    type="text"
                    placeholder="Cari jamaah (nama, KTP, paspor)..."
                    className={`${inputStyle} w-full md:w-1/3`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex flex-wrap gap-4">
                    <select
                        className={selectStyle}
                        value={filterPackage}
                        onChange={(e) => setFilterPackage(e.target.value)}
                    >
                        <option value="">Semua Paket</option>
                        {packages?.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                        ))}
                    </select>
                    <select
                        className={selectStyle}
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                    >
                        <option value="">Semua Status Bayar</option>
                        <option value="pending">Pending</option>
                        <option value="dp">DP</option>
                        <option value="installment">Cicilan</option>
                        <option value="paid">Lunas</option>
                    </select>
                    {canCreate && (
                        <button
                            onClick={() => openFormModal()}
                            className={buttonStyle.primary}
                        >
                            Tambah Jamaah Baru
                        </button>
                    )}
                </div>
            </div>

            {/* Tabel Data Jamaah */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className={tableStyle.table}>
                    <thead className={tableStyle.thead}>
                        <tr>
                            <th className={thStyle}>Nama</th>
                            <th className={thStyle}>Paket</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                            <th className={thStyle}>Total Paket</th>
                            <th className={thStyle}>Terbayar</th>
                            <th className={thStyle}>Status Bayar</th>
                            <th className={thStyle}>Verifikasi</th>
                            <th className={thStyle}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody className={tableStyle.tbody}>
                        {filteredJamaah.length > 0 ? filteredJamaah.map(item => {
                            const pkg = packages?.find(p => p.id == item.package_id);
                            const price = item.package_price > 0 ? item.package_price : (pkg?.price || 0);
                            const amountPaid = item.amount_paid || 0;
                            
                            let paymentStatusClass = '';
                            switch (item.payment_status) {
                                case 'paid': paymentStatusClass = 'bg-green-100 text-green-800'; break;
                                case 'installment':
                                case 'dp': paymentStatusClass = 'bg-yellow-100 text-yellow-800'; break;
                                case 'pending': paymentStatusClass = 'bg-red-100 text-red-800'; break;
                                default: paymentStatusClass = 'bg-gray-100 text-gray-800';
                            }

                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className={tdStyle}>
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.ktp_no}</div>
                                    </td>
                                    <td className={tdStyle}>{pkg?.name || 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{item.phone}</div>
                                        <div className="text-sm text-gray-500">{item.email}</div>
                                    </td>
                                    <td className={tdStyle}>{formatCurrency(price)}</td>
                                    <td className={tdStyle}>{formatCurrency(amountPaid)}</td>
                                    <td className={tdStyle}>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusClass}`}>
                                            {item.payment_status}
                                        </span>
                                    </td>
                                    <td className={tdStyle}>
                                        <div className="flex space-x-1">
                                            <span title="KTP" className={item.is_ktp_verified ? 'text-green-500' : 'text-gray-300'}>●</span>
                                            <span title="Paspor" className={item.is_passport_verified ? 'text-green-500' : 'text-gray-300'}>●</span>
                                            <span title="Foto" className={item.is_photo_verified ? 'text-green-500' : 'text-gray-300'}>●</span>
                                        </div>
                                    </td>
                                    <td className={`${tdStyle} space-x-2`}>
                                        {canManagePayments && (
                                            <button
                                                onClick={() => openPaymentModal(item)}
                                                className={buttonStyle.secondary}
                                            >
                                                Bayar
                                            </button>
                                        )}
                                        {canEdit && (
                                            <button
                                                onClick={() => openFormModal(item)}
                                                className={buttonStyle.warning}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className={buttonStyle.danger}
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-gray-500">
                                    Tidak ada data jamaah.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal untuk Form Tambah/Edit Jamaah */}
            {isModalOpen && (
                <Modal onClose={closeFormModal} title={selectedItem ? 'Edit Jamaah' : 'Tambah Jamaah Baru'}>
                    <div className="p-6">
                        {/* * PERBAIKAN: Menambahkan prop 'packages={packages}' 
                          * 'packages' didapat dari prop 'JamaahComponent' 
                          */}
                        <JamaahForm
                            initialData={selectedItem}
                            onClose={closeFormModal}
                            onSubmit={handleFormSubmit}
                            packages={packages} 
                        />
                    </div>
                </Modal>
            )}

            {/* Modal untuk Manajemen Pembayaran */}
            {isPaymentModalOpen && selectedJamaahForPayment && (
                <JamaahPaymentsModal
                    jamaah={selectedJamaahForPayment}
                    onClose={closePaymentModal}
                />
            )}
        </div>
    );
};

// Wrapper component untuk mengambil data jika diperlukan
// Dalam setup ini, data di-pass dari App.jsx, jadi kita hanya export komponen utama
export default JamaahComponent;