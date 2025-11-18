// Lokasi: src/components/forms/JamaahForm.jsx
import React, { useState, useEffect } from 'react';
import { formatDateForInput } from '../../utils/helpers';
import { ModalFooter } from '../common/Modal';
import { Input, Select, Checkbox, FormGroup, FormLabel } from '../common/FormUI';

// --- PENAMBAHAN: Terima prop 'sub_agents' ---
const JamaahForm = ({ initialData, onSubmit, onCancel, packages, sub_agents = [], onSave }) => {
    const [formData, setFormData] = useState({
        package_id: '',
        // --- PENAMBAHAN: Tambahkan 'sub_agent_id' ke state ---
        sub_agent_id: '',
        // --- AKHIR PENAMBAHAN ---
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
                // --- PENAMBAHAN: Pastikan 'sub_agent_id' di-load ---
                sub_agent_id: initialData.sub_agent_id || '',
                // --- AKHIR PENAMBAHAN ---
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
                // --- PENAMBAHAN: Reset 'sub_agent_id' ---
                sub_agent_id: '',
                // --- AKHIR PENAMBAHAN ---
                full_name: '', id_number: '', phone: '',
                email: '', address: '', gender: 'male', birth_date: '',
                passport_number: '', status: 'pending', total_price: '',
                equipment_status: 'belum_di_kirim', is_passport_verified: false,
                is_ktp_verified: false, is_kk_verified: false, is_meningitis_verified: false,
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
        // 'onSave' akan memanggil createOrUpdate dari Jamaah.jsx
        if (onSave) {
            onSave(formData);
        }
        if (onSubmit) {
            onSubmit(formData); // Fallback jika onSave tidak ada
        }
        onCancel(); // Tutup modal
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="package_id">Paket yang Diambil</FormLabel>
                    <Select name="package_id" id="package_id" value={formData.package_id} onChange={handleChange} required>
                        <option value="">Pilih Paket</option>
                        {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.title} ({pkg.departure_date ? formatDateForInput(pkg.departure_date) : 'N/A'})</option>
                        ))}
                    </Select>
                </FormGroup>

                {/* --- PENAMBAHAN: Dropdown Sub Agen --- */}
                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="sub_agent_id">Sub Agen (Opsional)</FormLabel>
                    <Select name="sub_agent_id" id="sub_agent_id" value={formData.sub_agent_id} onChange={handleChange}>
                        <option value="">Pilih Sub Agen (Jika ada)</option>
                        {/* Filter hanya agen yang aktif */}
                        {sub_agents.filter(agent => agent.status === 'active').map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </Select>
                </FormGroup>
                {/* --- AKHIR PENAMBAHAN --- */}

                <FormGroup>
                    <FormLabel htmlFor="full_name">Nama Lengkap</FormLabel>
                    <Input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="id_number">No. KTP (NIK)</FormLabel>
                    <Input type="text" name="id_number" id="id_number" value={formData.id_number} onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="phone">No. Telepon (WA)</FormLabel>
                    <Input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="birth_date">Tanggal Lahir</FormLabel>
                    <Input type="date" name="birth_date" id="birth_date" value={formData.birth_date} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="gender">Jenis Kelamin</FormLabel>
                    <Select name="gender" id="gender" value={formData.gender} onChange={handleChange}>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="passport_number">No. Paspor</FormLabel>
                    <Input type="text" name="passport_number" id="passport_number" value={formData.passport_number} onChange={handleChange} />
                </FormGroup>
                {/* --- PERBAIKAN: Typo </FormGrout> diperbaiki --- */}
                <FormGroup>
                    <FormLabel htmlFor="address">Alamat</FormLabel>
                    <Input type="text" name="address" id="address" value={formData.address} onChange={handleChange} />
                </FormGroup>
                {/* --- AKHIR PERBAIKAN --- */}

                <hr className="md:col-span-2" />
                <h4 className="md:col-span-2 text-lg font-semibold text-gray-800 -mb-2">Administrasi & Keuangan</h4>

                <FormGroup>
                    <FormLabel htmlFor="status">Status Jemaah</FormLabel>
                    <Select name="status" id="status" value={formData.status} onChange={handleChange}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlist">Waitlist</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="total_price">Total Tagihan (Rp)</FormLabel>
                    <Input
                        type="number"
                        name="total_price"
                        id="total_price"
                        value={formData.total_price}
                        onChange={handleChange}
                        placeholder="Otomatis jika kosong"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="equipment_status">Status Perlengkapan</FormLabel>
                    <Select name="equipment_status" id="equipment_status" value={formData.equipment_status} onChange={handleChange}>
                        <option value="belum_di_kirim">Belum Dikirim</option>
                        <option value="di_kirim">Dikirim</option>
                        <option value="diterima">Diterima</option>
                    </Select>
                </FormGroup>

                <hr className="md:col-span-2" />
                <h4 className="md:col-span-2 text-lg font-semibold text-gray-800 -mb-2">Checklist Verifikasi Dokumen (Admin)</h4>

                <FormGroup>
                    <Checkbox name="is_passport_verified" id="is_passport_verified" checked={!!formData.is_passport_verified} onChange={handleChange} label="Paspor Verified" />
                </FormGroup>
                <FormGroup>
                    <Checkbox name="is_ktp_verified" id="is_ktp_verified" checked={!!formData.is_ktp_verified} onChange={handleChange} label="KTP Verified" />
                </FormGroup>
                <FormGroup>
                    <Checkbox name="is_kk_verified" id="is_kk_verified" checked={!!formData.is_kk_verified} onChange={handleChange} label="KK Verified" />
                </FormGroup>
                <FormGroup>
                    <Checkbox name="is_meningitis_verified" id="is_meningitis_verified" checked={!!formData.is_meningitis_verified} onChange={handleChange} label="Meningitis Verified" />
                </FormGroup>
            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

export default JamaahForm;