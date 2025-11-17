// Lokasi: src/components/forms/UserForm.jsx

import React, { useState, useEffect } from 'react';
// --- PERBAIKAN: Path import absolut dari src/ ---
import { useApi } from 'context/ApiContext'; 
import { Input, Select } from 'components/common/FormUI'; 
import Loading from 'components/common/Loading'; 
import ErrorMessage from 'components/common/ErrorMessage';
// --- AKHIR PERBAIKAN ---

const UserForm = ({ data, onSuccess }) => {
    const api = useApi(); 
    const [formData, setFormData] = useState({
        user_email: '',
        user_pass: '',
        full_name: '',
        role: 'marketing_staff', // Default role
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = Boolean(data && data.id);

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                user_email: data.user_email || '',
                user_pass: '', // Jangan tampilkan password lama
                full_name: data.full_name || '',
                role: data.role || 'marketing_staff',
            });
        } else {
            // Reset form untuk user baru
            setFormData({
                user_email: '',
                user_pass: '',
                full_name: '',
                role: 'marketing_staff',
            });
        }
    }, [data, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!isEditMode && !formData.user_pass) {
            setError('Password wajib diisi untuk pengguna baru.');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = { ...formData, id: data ? data.id : null };
            await api.createOrUpdate('user', payload); // Menggunakan endpoint 'user'
            onSuccess(); // Tutup modal dan refresh data
        } catch (err) {
            setError(err.message || 'Gagal menyimpan pengguna.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const { data: apiData, loading: apiLoading } = api;
    const roleOptions = apiData.roles || [];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} />}
            
            <Input
                label="Email Pengguna"
                name="user_email"
                type="email"
                value={formData.user_email}
                onChange={handleChange}
                required
                disabled={isEditMode} // Email tidak bisa diubah
            />
            
            <Input
                label="Password"
                name="user_pass"
                type="password"
                value={formData.user_pass}
                onChange={handleChange}
                placeholder={isEditMode ? 'Kosongkan jika tidak ingin mengubah password' : ''}
                required={!isEditMode} // Wajib untuk user baru
            />

            <Input
                label="Nama Lengkap"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
            />

            <Select
                label="Role (Divisi)"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={apiLoading}
            >
                <option value="" disabled>Pilih Role...</option>
                {apiLoading ? (
                    <option value="" disabled>Memuat roles...</option>
                ) : (
                    roleOptions.map(role => (
                        <option key={role.role_key} value={role.role_key}>
                            {role.display_name}
                        </option>
                    ))
                )}
                {(!apiLoading && roleOptions.length === 0) && (
                    <>
                        <option value="owner">Owner</option>
                        <option value="admin_staff">Admin Staff</option>
                        <option value="finance_staff">Finance Staff</option>
                        <option value="marketing_staff">Marketing Staff</option>
                        <option value="hr_staff">HR Staff</option>
                    </>
                )}
            </Select>


            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loading text="Menyimpan..." /> : (isEditMode ? 'Update Pengguna' : 'Simpan Pengguna')}
                </button>
            </div>
        </form>
    );
};

export default UserForm;