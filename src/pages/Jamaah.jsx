import React, { useState, useEffect } from 'react';
// PERBAIKAN: Menambahkan ekstensi .js
import { formatDate, formatDateForInput } from '../../utils/helpers.js';
// PERBAIKAN: Menambahkan ekstensi .jsx
import { ModalFooter } from '../common/Modal.jsx';

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
        } else {
             // Reset form
            setFormData({
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

export default JamaahForm;