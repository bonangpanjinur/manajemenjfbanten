import React, { useState } from 'react';
import { Input, Select, Button, Textarea } from '../common/FormUI.jsx';

const JamaahForm = ({ initialData, packages = [], onSave, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || '',
        passport_number: initialData?.passport_number || '',
        id_number: initialData?.id_number || '', // NIK
        gender: initialData?.gender || 'L',
        phone_number: initialData?.phone_number || '',
        package_id: initialData?.package_id || (packages.length > 0 ? packages[0].id : ''),
        status: initialData?.status || 'registered',
        address: initialData?.address || '',
        birth_date: initialData?.birth_date || '',
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Lengkap (Sesuai Paspor)" name="full_name" value={formData.full_name} onChange={handleChange} required />
                <Input label="Nomor Paspor" name="passport_number" value={formData.passport_number} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="NIK / KTP" name="id_number" value={formData.id_number} onChange={handleChange} />
                <Select label="Jenis Kelamin" name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Pilih Paket Umroh" name="package_id" value={formData.package_id} onChange={handleChange} required>
                    <option value="">-- Pilih Paket --</option>
                    {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                    ))}
                </Select>
                <Select label="Status Pendaftaran" name="status" value={formData.status} onChange={handleChange}>
                    <option value="registered">Terdaftar</option>
                    <option value="dp_paid">Sudah DP</option>
                    <option value="paid_off">Lunas</option>
                    <option value="visa_processing">Proses Visa</option>
                    <option value="departed">Berangkat</option>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="No. Telepon / WA" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
                <Input label="Tanggal Lahir" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />
            </div>

            <Textarea label="Alamat Lengkap" name="address" value={formData.address} onChange={handleChange} />

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Data Jemaah'}
                </Button>
            </div>
        </form>
    );
};

export default JamaahForm;