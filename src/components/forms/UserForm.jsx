import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';
import { Input, Select } from '../common/FormUI.jsx';
import { ErrorMessage } from '../common/ErrorMessage.jsx';

const UserForm = ({ data, onSuccess }) => {
    const api = useApi();
    const { data: apiData, loading: apiLoading } = api;
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'marketing_staff',
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = Boolean(data && data.id);

    useEffect(() => {
        if (isEditMode && data) {
            setFormData({
                full_name: data.full_name || '',
                email: data.email || '',
                role: data.role || 'marketing_staff',
                password: '', 
            });
        }
    }, [data, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const payload = { ...formData };
        // PERBAIKAN: Menyesuaikan nama field dengan API Users (full_name, email, password)
        
        if (isEditMode) {
            payload.id = data.id;
            if (!payload.password) delete payload.password;
        }

        try {
            // PERBAIKAN: Menggunakan endpoint 'users' (jamak)
            await api.createOrUpdate('users', payload, isEditMode ? data.id : null);
            onSuccess();
        } catch (err) {
            setError(err.message || 'Gagal menyimpan data.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Ambil roles dari API atau hardcode sebagai fallback
    const roleOptions = apiData.roles && apiData.roles.length > 0 
        ? apiData.roles 
        : [
            { role_key: 'marketing_staff', display_name: 'Marketing Staff' },
            { role_key: 'finance_staff', display_name: 'Finance Staff' },
            { role_key: 'hr_staff', display_name: 'HR Staff' },
            { role_key: 'admin_staff', display_name: 'Admin Staff' }
        ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorMessage message={error} />}
            
            <Input
                label="Nama Lengkap"
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                required
            />
            
            <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEditMode}
            />
            
            <Input
                label={isEditMode ? "Password (Kosongkan jika tidak diubah)" : "Password"}
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
            />

            <Select
                label="Role / Jabatan"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
            >
                <option value="" disabled>Pilih Role</option>
                {roleOptions.map(role => (
                    <option key={role.role_key || role.id} value={role.role_key || role.name}>
                        {role.display_name || role.name}
                    </option>
                ))}
            </Select>

            <div className="pt-2 flex justify-end">
                 <button 
                    type="submit" 
                    disabled={isSubmitting || apiLoading}
                    className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Update Staff' : 'Tambah Staff')}
                </button>
            </div>
        </form>
    );
};

export default UserForm;