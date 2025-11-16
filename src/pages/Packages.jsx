import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { formatCurrency, formatDate, formatDateForInput, getStatusBadge } from '../utils/helpers';
import { Modal, ModalFooter } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Plus, Edit2, Trash2 } from 'lucide-react';

// Form ini hanya digunakan oleh halaman Packages, jadi kita biarkan di file ini.
const PackageForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        status: 'draft',
        promo: 0,
        departure_city: '',
        duration: 9,
        departure_date: '',
        slots_available: 50,
        price_quad: '',
        price_triple: '',
        price_double: '',
        short_description: '',
        itinerary: '',
        meta_title: '',
        meta_description: '',
        ...initialData,
    });

    useEffect(() => {
        if (initialData) {
             // Deserialisasi price_details
            if (initialData.price_details) {
                try {
                    const prices = JSON.parse(initialData.price_details);
                    setFormData(prev => ({
                        ...prev,
                        price_quad: prices.quad || '',
                        price_triple: prices.triple || '',
                        price_double: prices.double || '',
                    }));
                } catch (e) {
                    console.error("Gagal parse price_details JSON:", e);
                }
            }
            // Format tanggal untuk input
            if (initialData.departure_date) {
                setFormData(prev => ({
                    ...prev,
                    departure_date: formatDateForInput(initialData.departure_date)
                }));
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const price_details = JSON.stringify({
            quad: formData.price_quad || 0,
            triple: formData.price_triple || 0,
            double: formData.price_double || 0,
        });

        const dataToSubmit = { ...formData };
        delete dataToSubmit.price_quad;
        delete dataToSubmit.price_triple;
        delete dataToSubmit.price_double;
        
        dataToSubmit.price_details = price_details;
        
        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Judul Paket</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Slug (URL)</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} />
                </div>
                
                 <div className="form-group">
                    <label>Durasi (Hari)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Kota Keberangkatan</label>
                    <input type="text" name="departure_city" value={formData.departure_city} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Tanggal Keberangkatan (Opsional)</label>
                    <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Jumlah Slot Tersedia</label>
                    <input type="number" name="slots_available" value={formData.slots_available} onChange={handleChange} />
                </div>

                <div className="form-group checkbox-group full-width" style={{ marginTop: '10px' }}>
                    <input type="checkbox" id="promo" name="promo" checked={!!formData.promo} onChange={handleChange} />
                    <label htmlFor="promo">Tandai sebagai Promo</label>
                </div>

                <hr className="full-width" />
                <h4 className="full-width" style={{ margin: 0 }}>Detail Harga</h4>
                 <div className="form-group">
                    <label>Harga Quad (Rp)</label>
                    <input type="number" name="price_quad" value={formData.price_quad} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label>Harga Triple (Rp)</label>
                    <input type="number" name="price_triple" value={formData.price_triple} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label>Harga Double (Rp)</label>
                    <input type="number" name="price_double" value={formData.price_double} onChange={handleChange} />
                </div>

                <hr className="full-width" />
                <h4 className="full-width" style={{ margin: 0 }}>Deskripsi & SEO</h4>
                <div className="form-group full-width">
                    <label>Deskripsi Singkat</label>
                    <textarea name="short_description" value={formData.short_description} onChange={handleChange}></textarea>
                </div>
                <div className="form-group full-width">
                    <label>Itinerary (JSON/Text)</label>
                    <textarea name="itinerary" value={formData.itinerary} onChange={handleChange}></textarea>
                </div>
                 <div className="form-group">
                    <label>Meta Title (SEO)</label>
                    <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label>Meta Description (SEO)</label>
                    <input type="text" name="meta_description" value={formData.meta_description} onChange={handleChange} />
                </div>

            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

// Komponen Halaman Utama
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
        if (window.confirm('Yakin ingin menghapus paket ini?')) {
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
            return prices.quad || prices.triple || prices.double || 0;
        } catch(e) {
            return 0;
        }
    };

    return (
        <div className="umh-component-container">
            <div className="umh-table-toolbar">
                <h2>Manajemen Paket</h2>
                <button className="umh-button" onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Tambah Paket
                </button>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="umh-table-wrapper">
                    <table className="umh-table">
                        <thead>
                            <tr>
                                <th>Judul Paket</th>
                                <th>Status</th>
                                <th>Tgl Berangkat</th>
                                <th>Durasi</th>
                                <th>Kota</th>
                                <th>Harga Mulai</th>
                                <th>Slot</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.length === 0 && <tr><td colSpan="8" style={{textAlign: 'center', padding: '16px'}}>Tidak ada paket.</td></tr>}
                            {packages.map(pkg => (
                                <tr key={pkg.id}>
                                    <td>{pkg.title}</td>
                                    <td>{getStatusBadge(pkg.status)}</td>
                                    <td>{formatDate(pkg.departure_date)}</td>
                                    <td>{pkg.duration} Hari</td>
                                    <td>{pkg.departure_city}</td>
                                    <td>{formatCurrency(getLowestPrice(pkg.price_details))}</td>
                                    <td>{pkg.slots_filled || 0} / {pkg.slots_available || 0}</td>
                                    <td className="actions">
                                        <Edit2 size={18} className="action-icon" onClick={() => handleOpenModal(pkg)} title="Edit Paket" />
                                        <Trash2 size={18} className="action-icon danger" onClick={() => handleDelete(pkg.id)} title="Hapus Paket" />
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