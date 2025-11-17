// Lokasi: src/components/forms/LeadForm.jsx

import React, { useState, useEffect } from 'react';
// --- PERBAIKAN: Path import relatif dengan ekstensi .jsx ---
import { useApi } from '../../context/ApiContext.jsx'; 
import { useAuth } from '../../context/AuthContext.jsx';
import { Input, Select, Textarea } from '../common/FormUI.jsx'; 
import Loading from '../common/Loading.jsx'; 
import ErrorMessage from '../common/ErrorMessage.jsx';
// --- AKHIR PERBAIKAN ---

const LeadForm = ({ data, onSuccess }) => {
// ... sisa kode ...
// ... (Kode yang ada sebelumnya tidak diubah) ...
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        email: '',
        source: 'whatsapp',
        status: 'new',
        assigned_to_user_id: '',
        package_of_interest_id: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const { data: apiData, loading: apiLoading } = api;
    const marketingSources = ['whatsapp', 'facebook', 'instagram', 'website', 'referral', 'walk_in', 'other'];
    const leadStatuses = ['new', 'contacted', 'qualified', 'lost', 'converted'];
    
    const assignableUsers = (apiData.users || []).filter(user => 
        ['marketing_staff', 'admin_staff', 'owner'].includes(user.role)
    );
    const packages = apiData.packages || [];

    useEffect(() => {
        if (data) {
            // Mode Edit
            setFormData({
                full_name: data.full_name || '',
                phone_number: data.phone_number || '',
                email: data.email || '',
                source: data.source || 'whatsapp',
                status: data.status || 'new',
                assigned_to_user_id: data.assigned_to_user_id || '',
                package_of_interest_id: data.package_of_interest_id || '',
                notes: data.notes || '',
            });
        } else {
            // Mode Buat Baru
            let defaultAssignedUser = '';
            if (currentUser && currentUser.role === 'marketing_staff') {
                defaultAssignedUser = currentUser.id;
            }

            setFormData({
                full_name: '',
                phone_number: '',
                email: '',
                source: 'whatsapp',
                status: 'new',
                assigned_to_user_id: defaultAssignedUser, // Set default
                package_of_interest_id: '',
                notes: '',
            });
        }
    }, [data, currentUser]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = { ...formData, id: data ? data.id : null };
            payload.assigned_to_user_id = payload.assigned_to_user_id ? parseInt(payload.assigned_to_user_id) : null;
            payload.package_of_interest_id = payload.package_of_interest_id ? parseInt(payload.package_of_interest_id) : null;
            
            await api.createOrUpdate('marketing', payload);
            onSuccess(); 
        } catch (err) {
            setError(err.message || 'Gagal menyimpan lead.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Nama Lengkap"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Nomor Telepon (WhatsApp)"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                />
            </div>

            <Input
                label="Email (Opsional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="Sumber Lead"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                >
                    {marketingSources.map(source => (
                        <option key={source} value={source}>
                            {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
                        </option>
                    ))}
                </Select>

                <Select
                    label="Status Lead"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    {leadStatuses.map(status => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="Ditugaskan Ke (Karyawan)"
                    name="assigned_to_user_id"
                    value={formData.assigned_to_user_id}
                    onChange={handleChange}
                    disabled={apiLoading}
                >
                    <option value="">Tidak Ditugaskan</option>
                    {apiLoading ? (
                        <option value="" disabled>Memuat user...</option>
                    ) : (
                        assignableUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.full_name || user.user_email} ({user.role})
                            </option>
                        ))
                    )}
                </Select>

                <Select
                    label="Paket yang Diminati (Opsional)"
                    name="package_of_interest_id"
                    value={formData.package_of_interest_id}
                    onChange={handleChange}
                    disabled={apiLoading}
                >
                    <option value="">Pilih Paket...</option>
                    {apiLoading ? (
                        <option value="" disabled>Memuat paket...</option>
                    ) : (
                        packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>
                                {pkg.name}
                            </option>
                        ))
                    )}
                </Select>
            </div>

            <Textarea
                label="Catatan (Opsional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
            />
            
            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loading text="Menyimpan..." /> : (data ? 'Update Lead' : 'Simpan Lead')}
                </button>
            </div>
        </form>
    );
};

export default LeadForm;