import React, { useState, useEffect } from 'react';
// PERBAIKAN: Menambahkan ekstensi .js
import { formatDateForInput } from '../../utils/helpers.js';
// PERBAIKAN: Menambahkan ekstensi .jsx
import { ModalFooter } from '../common/Modal.jsx';

// Form ini hanya digunakan oleh halaman Packages
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
    });

    useEffect(() => {
        if (initialData) {
             setFormData({
                ...initialData,
                promo: !!initialData.promo, // Pastikan boolean
                departure_date: formatDateForInput(initialData.departure_date),
                price_quad: '', // default
                price_triple: '', // default
                price_double: '', // default
             });
             
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
        } else {
            // Reset form
             setFormData({
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
            });
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

export default PackageForm;