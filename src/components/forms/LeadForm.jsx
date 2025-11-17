import React, { useState, useEffect } from 'react';
// PERBAIKAN: Path impor 2 level ke atas
import { useApi } from '../../context/ApiContext';
// PERBAIKAN: Path impor 1 level ke atas
import { Input, Textarea, Button, Select } from '../common/FormUI';
// PERBAIKAN: Impor bernama (named import) dan path 1 level ke atas
import { ErrorMessage } from '../common/ErrorMessage';
import { LoadingSpinner as Loading } from '../common/Loading';
// AKHIR PERBAIKAN

const LeadForm = ({ data, onClose }) => {
    const { createOrUpdate, loading: apiLoading, error: apiError } = useApi();
    
    const [formData, setFormData] = useState(
        data || {
            name: '',
            email: '',
            phone: '',
            source: 'Website',
            status: 'new',
            notes: '',
        }
    );
    const [error, setError] = useState(null);

    // Sinkronkan error dari API
    useEffect(() => {
        if (apiError) {
            setError(apiError);
        }
    }, [apiError]);

    // Update form state saat ada perubahan
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        const finalData = { ...formData };
        // Tambahkan ID jika ini adalah update
        if (data && data.id) {
            finalData.id = data.id;
        }

        try {
            // 'marketing' adalah key untuk endpoint API leads
            await createOrUpdate('marketing', finalData);
            onClose(); // Tutup modal jika sukses
        } catch (err) {
            setError(err.message || 'Gagal menyimpan lead.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorMessage message={error} />}
            
            <Input
                label="Nama"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
            />
            <Input
                label="Telepon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
            />
            <Select
                label="Sumber Lead"
                name="source"
                value={formData.source}
                onChange={handleChange}
            >
                <option value="Website">Website</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Lainnya</option>
            </Select>
            <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
            >
                <option value="new">Baru</option>
                <option value="contacted">Dihubungi</option>
                <option value="qualified">Kualifikasi</option>
                <option value="lost">Gagal</option>
                <option value="converted">Konversi</option>
            </Select>
            <Textarea
                label="Catatan"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
            />
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={onClose} disabled={apiLoading}>
                    Batal
                </Button>
                <Button type="submit" disabled={apiLoading}>
                    {apiLoading ? <Loading /> : (data ? 'Update' : 'Simpan')}
                </Button>
            </div>
        </form>
    );
};

export default LeadForm;