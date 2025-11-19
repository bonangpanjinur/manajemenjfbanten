import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext.jsx';
import { Input, Select, Button, Textarea } from '../common/FormUI.jsx';

const LeadForm = ({ data, onClose }) => {
    const { createOrUpdate } = useApi();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: data?.name || '',
        email: data?.email || '',
        phone: data?.phone || '',
        source: data?.source || 'social_media',
        status: data?.status || 'new',
        notes: data?.notes || '',
    });

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createOrUpdate('marketing', formData, data?.id);
            onClose();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <Input label="Nama Prospek" name="name" value={formData.name} onChange={handleChange} required />
            
            <div className="grid grid-cols-2 gap-4">
                <Input label="No. WhatsApp" name="phone" value={formData.phone} onChange={handleChange} required />
                <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Select label="Sumber" name="source" value={formData.source} onChange={handleChange}>
                    <option value="social_media">Media Sosial (IG/FB)</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral / Teman</option>
                    <option value="walk_in">Datang Langsung</option>
                    <option value="agent">Agen</option>
                </Select>
                <Select label="Status Lead" name="status" value={formData.status} onChange={handleChange}>
                    <option value="new">Baru</option>
                    <option value="contacted">Sudah Dihubungi</option>
                    <option value="qualified">Potensial (Qualified)</option>
                    <option value="lost">Batal / Lost</option>
                    <option value="converted">Closing (Jadi Jemaah)</option>
                </Select>
            </div>

            <Textarea label="Catatan Tambahan" name="notes" value={formData.notes} onChange={handleChange} rows={3} />

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Simpan...' : 'Simpan Lead'}</Button>
            </div>
        </form>
    );
};

export default LeadForm;