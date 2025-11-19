import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext.jsx';
import { Input, Button, Select } from '../common/FormUI.jsx';

const SubAgentForm = ({ initialData, closeModal }) => {
    const { createOrUpdate } = useApi();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        status: initialData?.status || 'active',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createOrUpdate('sub_agents', formData, initialData?.id);
            closeModal();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <Input label="Nama Agen / Travel" name="name" value={formData.name} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
                <Input label="No. Telepon" name="phone" value={formData.phone} onChange={handleChange} required />
                <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Kota Domisili" name="city" value={formData.city} onChange={handleChange} />
                <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                </Select>
            </div>
            <Input label="Alamat Lengkap" name="address" value={formData.address} onChange={handleChange} />
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Batal</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
        </form>
    );
};

export default SubAgentForm;