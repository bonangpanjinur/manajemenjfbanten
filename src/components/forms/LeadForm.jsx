import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import { Input, Select, Textarea, Button } from '../common/FormUI';

const LeadForm = ({ initialData, onSuccess, onCancel }) => {
    const { apiCall } = useApi();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData || {
        name: '',
        contact: '',
        source: 'wa',
        status: 'new',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await apiCall(`/leads/${initialData.id}`, 'PUT', formData);
            } else {
                await apiCall('/leads', 'POST', formData);
            }
            onSuccess();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama Calon Jamaah" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Kontak (WA/HP)" name="contact" value={formData.contact} onChange={handleChange} required />
            
            <div className="grid grid-cols-2 gap-4">
                <Select label="Sumber" name="source" value={formData.source} onChange={handleChange}>
                    <option value="wa">WhatsApp</option>
                    <option value="ig">Instagram</option>
                    <option value="fb">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="offline">Offline / Walk-in</option>
                </Select>
                <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="new">Baru Dihubungi</option>
                    <option value="prospect">Prospek</option>
                    <option value="closing">Closing (Jadi Jamaah)</option>
                    <option value="lost">Lost (Batal)</option>
                </Select>
            </div>

            <Textarea label="Catatan" name="notes" value={formData.notes} onChange={handleChange} rows={3} />

            <div className="flex justify-end gap-2 pt-2">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-700">Batal</Button>
                <Button type="submit" className="bg-blue-600 text-white">Simpan</Button>
            </div>
        </form>
    );
};

export default LeadForm;