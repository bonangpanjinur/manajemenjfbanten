import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext.jsx';
import { Input, Textarea, Select, Button } from '../common/FormUI.jsx';
import { formatCurrency, parseCurrency } from '../../utils/helpers.js';

const PackageForm = ({ data, onClose }) => {
    const { createOrUpdate } = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: data?.name || '',
        description: data?.description || '',
        price: data ? formatCurrency(data.price) : '',
        duration_days: data?.duration_days || 9,
        start_date: data?.start_date || '',
        end_date: data?.end_date || '',
        departure_city: data?.departure_city || 'Jakarta',
        total_seats: data?.total_seats || 45,
        available_seats: data?.available_seats || 45,
        status: data?.status || 'available',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price') {
            setFormData(prev => ({ ...prev, price: formatCurrency(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...formData,
            price: parseCurrency(formData.price),
            duration_days: parseInt(formData.duration_days),
            total_seats: parseInt(formData.total_seats),
            available_seats: parseInt(formData.available_seats),
        };

        try {
            // FIX: Endpoint 'packages'
            await createOrUpdate('packages', payload, data?.id);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
            
            <Input label="Nama Paket" name="name" value={formData.name} onChange={handleChange} required />
            
            <div className="grid grid-cols-2 gap-4">
                <Input label="Harga (IDR)" name="price" value={formData.price} onChange={handleChange} required />
                <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="available">Tersedia</option>
                    <option value="full">Penuh</option>
                    <option value="completed">Selesai</option>
                </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Input label="Durasi (Hari)" type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} />
                <Input label="Tanggal Berangkat" type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
                <Input label="Tanggal Pulang" type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <Input label="Total Seat" type="number" name="total_seats" value={formData.total_seats} onChange={handleChange} />
                 <Input label="Sisa Seat" type="number" name="available_seats" value={formData.available_seats} onChange={handleChange} />
            </div>

            <Textarea label="Deskripsi" name="description" value={formData.description} onChange={handleChange} />

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
        </form>
    );
};

export default PackageForm;