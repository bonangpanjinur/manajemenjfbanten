import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../context/ApiContext';
import { formatCurrency, formatDate, formatDateForInput, getStatusBadge } from '../utils/helpers';
import { Modal, ModalFooter } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { User, CreditCard, Edit2, Trash2, Search, CheckCircle, XSquare, Plus } from 'lucide-react';

// Form Jemaah
const JamaahForm = ({ initialData, onSubmit, onCancel, packages }) => {
    const [formData, setFormData] = useState({
        package_id: '',
        full_name: '',
        id_number: '',
        phone: '',
        email: '',
        address: '',
        gender: 'male',
        birth_date: '',
        passport_number: '',
        status: 'pending',
        total_price: '', 
        equipment_status: 'belum_di_kirim',
        is_passport_verified: false,
        is_ktp_verified: false,
        is_kk_verified: false,
        is_meningitis_verified: false,
    });
    
     useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                is_passport_verified: !!initialData.is_passport_verified,
                is_ktp_verified: !!initialData.is_ktp_verified,
                is_kk_verified: !!initialData.is_kk_verified,
                is_meningitis_verified: !!initialData.is_meningitis_verified,
                birth_date: formatDateForInput(initialData.birth_date),
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Paket yang Diambil</label>
                    <select name="package_id" value={formData.package_id} onChange={handleChange} required>
                        <option value="">Pilih Paket</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.title} ({formatDate(pkg.departure_date)})</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>No. KTP (NIK)</label>
                    <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>No. Telepon (WA)</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Tanggal Lahir</label>
                    <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Jenis Kelamin</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>No. Paspor</label>
                    <input type="text" name="passport_number" value={formData.passport_number} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Alamat</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
                </div>

                <hr className="full-width" />
                <h4 className="full-width" style={{ margin: 0 }}>Administrasi & Keuangan</h4>

                <div className="form-group">
                    <label>Status Jemaah</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlist">Waitlist</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Total Tagihan (Rp)</label>
                    <input 
                        type="number" 
                        name="total_price" 
                        value={formData.total_price} 
                        onChange={handleChange} 
                        placeholder="Otomatis jika kosong"
                    />
                </div>
                
                <div className="form-group">
                    <label>Status Perlengkapan</label>
                    <select name="equipment_status" value={formData.equipment_status} onChange={handleChange}>
                        <option value="belum_di_kirim">Belum Dikirim</option>
                        <option value="di_kirim">Dikirim</option>
                        <option value="diterima">Diterima</option>
                    </select>
                </div>

                <hr className="full-width" />
                <h4 className="full-width" style={{ margin: 0 }}>Checklist Verifikasi Dokumen (Admin)</h4>

                <div className="form-group checkbox-group">
                    <input type="checkbox" id="is_passport_verified" name="is_passport_verified" checked={!!formData.is_passport_verified} onChange={handleChange} />
                    <label htmlFor="is_passport_verified">Paspor Verified</label>
                </div>
                <div className="form-group checkbox-group">
                    <input type="checkbox" id="is_ktp_verified" name="is_ktp_verified" checked={!!formData.is_ktp_verified} onChange={handleChange} />
                    <label htmlFor="is_ktp_verified">KTP Verified</label>
                </div>
                <div className="form-group checkbox-group">
                    <input type="checkbox" id="is_kk_verified" name="is_kk_verified" checked={!!formData.is_kk_verified} onChange={handleChange} />
                    <label htmlFor="is_kk_verified">KK Verified</label>
                </div>
                 <div className="form-group checkbox-group">
                    <input type="checkbox" id="is_meningitis_verified" name="is_meningitis_verified" checked={!!formData.is_meningitis_verified} onChange={handleChange} />
                    <label htmlFor="is_meningitis_verified">Meningitis Verified</label>
                </div>

            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

// Modal Pembayaran Jemaah
const JamaahPaymentsModal = ({ isOpen, onClose, jamaah }) => {
    const api = useApi(); // Gunakan hook di dalam komponen
    const { 
        jamaahPayments, 
        loadingPayments, 
        fetchJamaahPayments, 
        saveJamaahPayment, 
        deleteJamaahPayment 
    } = api;
    
    const [newPayment, setNewPayment] = useState({
        amount: '',
        description: '',
        payment_date: formatDateForInput(new Date()),
    });

    useEffect(() => {
        if (isOpen && jamaah) {
            fetchJamaahPayments(jamaah.id);
        } else if (!isOpen) {
            fetchJamaahPayments(null); // Clear payments saat modal ditutup
        }
    }, [isOpen, jamaah, fetchJamaahPayments]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPayment(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewPayment = async (e) => {
        e.preventDefault();
        if (!newPayment.amount || !newPayment.payment_date) {
            alert("Jumlah dan Tanggal wajib diisi.");
            return;
        }
        try {
            await saveJamaahPayment(jamaah.id, newPayment);
            setNewPayment({
                amount: '',
                description: '',
                payment_date: formatDateForInput(new Date()),
            });
        } catch (error) {
            alert(`Gagal menyimpan: ${error.message}`);
        }
    };

    const handleVerifyPayment = async (payment) => {
        if (!confirm("Anda yakin ingin MEMVERIFIKASI pembayaran ini?")) return;
        try {
            await saveJamaahPayment(jamaah.id, { ...payment, status: 'verified' });
        } catch (error) {
            alert(`Gagal verifikasi: ${error.message}`);
        }
    };
    
    const handleRejectPayment = async (payment) => {
         if (!confirm("Anda yakin ingin MENOLAK pembayaran ini?")) return;
        try {
            await saveJamaahPayment(jamaah.id, { ...payment, status: 'rejected' });
        } catch (error) {
            alert(`Gagal menolak: ${error.message}`);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (!confirm("Anda yakin ingin MENGHAPUS riwayat pembayaran ini? Ini tidak bisa dikembalikan.")) return;
        try {
            await deleteJamaahPayment(jamaah.id, paymentId);
        } catch (error) {
            alert(`Gagal menghapus: ${error.message}`);
        }
    };
    
    if (!jamaah) return null;

    // Ambil data jemaah terbaru dari API context untuk Tampilan Saldo
    const updatedJamaah = api.jamaah.find(j => j.id === jamaah.id) || jamaah;
    const sisaTagihan = (updatedJamaah.total_price || 0) - (updatedJamaah.amount_paid || 0);

    return (
        <Modal 
            title={`Riwayat Pembayaran: ${updatedJamaah.full_name}`} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            {loadingPayments && <p>Memuat riwayat...</p>}
            
            <div className="finance-summary" style={{ marginBottom: '20px' }}>
                 <div className="summary-card">
                    <h4>Total Tagihan</h4>
                    <p>{formatCurrency(updatedJamaah.total_price)}</p>
                </div>
                 <div className="summary-card">
                    <h4>Total Terbayar (Verified)</h4>
                    <p className="kredit">{formatCurrency(updatedJamaah.amount_paid)}</p>
                </div>
                 <div className="summary-card">
                    <h4>Sisa Tagihan</h4>
                    <p className="debit">{formatCurrency(sisaTagihan)}</p>
                </div>
            </div>

            <h4 style={{ margin: '15px 0 10px 0' }}>Riwayat Transaksi</h4>
            <ul className="payment-history-list">
                {jamaahPayments.length === 0 && !loadingPayments && <li>Tidak ada riwayat pembayaran.</li>}
                {jamaahPayments.map(p => (
                    <li key={p.id}>
                        <div className="payment-info">
                            <strong>{formatCurrency(p.amount)}</strong>
                            <span>{p.description || 'Pembayaran'} - {formatDate(p.payment_date)}</span>
                        </div>
                        <div className="payment-actions">
                            {getStatusBadge(p.status)}
                            {p.status === 'pending' && (
                                <>
                                <button 
                                    className="umh-button" 
                                    style={{ padding: '4px 8px', fontSize: '0.8em', background: 'var(--success)'}}
                                    onClick={() => handleVerifyPayment(p)}
                                    title="Verifikasi"
                                >
                                    <CheckCircle size={14} />
                                </button>
                                <button 
                                    className="umh-button secondary" 
                                    style={{ padding: '4px 8px', fontSize: '0.8em', background: 'var(--warning)'}}
                                    onClick={() => handleRejectPayment(p)}
                                    title="Tolak"
                                >
                                    <XSquare size={14} />
                                </button>
                                </>
                            )}
                             <Trash2 
                                size={18} 
                                className="action-icon danger" 
                                onClick={() => handleDeletePayment(p.id)} 
                                title="Hapus"
                            />
                        </div>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleAddNewPayment} className="payment-form">
                <h4 style={{ margin: '0 0 15px 0' }}>Tambah Pembayaran Baru</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Jumlah (Rp)</label>
                        <input
                            type="number"
                            name="amount"
                            value={newPayment.amount}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                     <div className="form-group">
                        <label>Tanggal Bayar</label>
                        <input
                            type="date"
                            name="payment_date"
                            value={newPayment.payment_date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-group full-width">
                    <label>Keterangan (Cth: DP, Cicilan 1, Pelunasan)</label>
                    <input
                        type="text"
                        name="description"
                        value={newPayment.description}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="umh-button">
                    <Plus size={16} /> Tambah
                </button>
            </form>
        </Modal>
    );
};

// Komponen Halaman Utama Jemaah
const JamaahComponent = ({ onOpenPayments }) => {
    const { jamaah, packages, saveJamaah, deleteJamaah, loading, error } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJamaah, setSelectedJamaah] = useState(null);
    const [filterPackage, setFilterPackage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (jamaah = null) => {
        setSelectedJamaah(jamaah);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedJamaah(null);
    };

    const handleSave = async (jamaah) => {
        try {
            await saveJamaah(jamaah);
            handleCloseModal();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus jemaah ini? Semua data pembayaran terkait akan ikut terhapus.')) {
            try {
                await deleteJamaah(id);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };
    
    const getDocumentStatus = (j) => {
        const totalDocs = 4;
        let verifiedDocs = 0;
        if (j.is_passport_verified) verifiedDocs++;
        if (j.is_ktp_verified) verifiedDocs++;
        if (j.is_kk_verified) verifiedDocs++;
        if (j.is_meningitis_verified) verifiedDocs++;
        
        if (verifiedDocs === totalDocs) return getStatusBadge('Lengkap');
        if (verifiedDocs > 0) return getStatusBadge(`${verifiedDocs}/${totalDocs}`);
        return getStatusBadge('Belum');
    };

    const filteredJamaah = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return jamaah.filter(j => {
            if (filterPackage && j.package_id != filterPackage) {
                return false;
            }
            if (searchTerm) {
                return (
                    j.full_name?.toLowerCase().includes(lowerSearch) ||
                    j.id_number?.toLowerCase().includes(lowerSearch) ||
                    j.phone?.toLowerCase().includes(lowerSearch) ||
                    j.email?.toLowerCase().includes(lowerSearch)
                );
            }
            return true;
        });
    }, [jamaah, filterPackage, searchTerm]);

    return (
        <div className="umh-component-container">
            <div className="umh-table-toolbar">
                <h2>Manajemen Jemaah</h2>
                <button className="umh-button" onClick={() => handleOpenModal()}>
                    <User size={16} /> Tambah Jemaah
                </button>
            </div>

            <div className="umh-sub-header">
                <div className="filter-group">
                    <label htmlFor="search-jemaah">Cari Jemaah:</label>
                    <div className="search-wrapper">
                        <Search size={16} />
                        <input 
                            id="search-jemaah"
                            type="text"
                            placeholder="Nama, NIK, HP, Email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <label htmlFor="filter-paket">Filter Paket:</label>
                    <select 
                        id="filter-paket"
                        value={filterPackage} 
                        onChange={e => setFilterPackage(e.target.value)}
                    >
                        <option value="">Semua Paket</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.title} ({formatDate(pkg.departure_date)})</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="umh-table-wrapper">
                    <table className="umh-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Paket</th>
                                <th>Status Bayar</th>
                                <th>Sisa Tagihan</th>
                                <th>Dokumen</th>
                                <th>Perlengkapan</th>
                                <th>Kontak</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJamaah.length === 0 && <tr><td colSpan="8" style={{textAlign: 'center', padding: '16px'}}>Tidak ada jemaah yang cocok.</td></tr>}
                            {filteredJamaah.map(j => {
                                const sisa = (j.total_price || 0) - (j.amount_paid || 0);
                                return (
                                    <tr key={j.id}>
                                        <td>{j.full_name}</td>
                                        <td>{j.package_name || '...'}</td>
                                        <td>{getStatusBadge(j.payment_status)}</td>
                                        <td style={{ color: sisa > 0 ? 'var(--danger)' : 'var(--success)'}}>
                                            {formatCurrency(sisa)}
                                        </td>
                                        <td>{getDocumentStatus(j)}</td>
                                        <td>{getStatusBadge(j.equipment_status)}</td>
                                        <td>{j.phone}</td>
                                        <td className="actions">
                                            <button 
                                                className="umh-button" 
                                                style={{ padding: '4px 8px', fontSize: '0.8em'}}
                                                onClick={() => onOpenPayments(j)}
                                                title="Riwayat Pembayaran"
                                            >
                                                <CreditCard size={14} />
                                            </button>
                                            <Edit2 size={18} className="action-icon" onClick={() => handleOpenModal(j)} title="Edit Jemaah" />
                                            <Trash2 size={18} className="action-icon danger" onClick={() => handleDelete(j.id)} title="Hapus Jemaah" />
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