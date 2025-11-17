// Lokasi: src/components/forms/UserForm.jsx

import React, { useState, useEffect } from 'react';
// --- PERBAIKAN: Menambahkan kembali ekstensi .jsx untuk resolver ---
import { useApi } from '../../context/ApiContext.jsx'; 
import { Input, Select } from '../common/FormUI.jsx'; 
// --- PERBAIKAN: Mengganti impor default ke impor named (dan menambah .jsx) ---
import { LoadingSpinner } from '../common/Loading.jsx'; 
import { ErrorMessage } from '../common/ErrorMessage.jsx';
// --- AKHIR PERBAIKAN ---

/**
 * Form untuk menambah atau mengedit User.
 * Menerima props 'data' untuk mode edit dan 'onSuccess' callback.
 */
const UserForm = ({ data, onSuccess }) => {
    const api = useApi(); 
    
    // State untuk form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'marketing_staff', // Default role
    });
    
    // State untuk proses submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Cek apakah mode edit (jika ada 'data' dan 'data.id')
    const isEditMode = Boolean(data && data.id);

    // useEffect untuk populate form jika mode edit
    useEffect(() => {
        if (isEditMode && data) {
            // Jika mode edit, isi form dengan data yang ada
            setFormData({
                name: data.name || '',
                email: data.email || '',
                role: data.role || 'marketing_staff',
                password: '', // Password dikosongkan, diisi hanya jika ingin diubah
            });
        }
    }, [data, isEditMode]); // Dependency: data dan isEditMode

    // Handler untuk perubahan input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler untuk submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset error setiap kali submit
        setIsSubmitting(true);

        // Siapkan payload
        const payload = { ...formData };
        if (isEditMode) {
            payload.id = data.id;
            // Jika password tidak diisi saat edit, jangan kirim field password
            // API akan mengerti bahwa password tidak diubah
            if (!payload.password) { 
                delete payload.password;
            }
        }

        try {
            // Panggil API (create atau update)
            await api.createOrUpdate('user', payload); // Menggunakan endpoint 'user'
            onSuccess(); // Panggil callback sukses (misal: tutup modal, refresh data)
        } catch (err) {
            setError(err.message || 'Gagal menyimpan data. Silakan coba lagi.');
            console.error(err);
        } finally {
            setIsSubmitting(false); // Selesai submitting
        }
    };

    // Ambil data dari API context (terutama untuk roles)
    const { data: apiData, loading: apiLoading } = api;
    const roleOptions = apiData.roles || [];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Tampilkan loading global jika data context (roles) sedang dimuat */}
            {/* {apiLoading && <LoadingSpinner />} */} 
            {/* Note: Mungkin lebih baik nonaktifkan form/tombol saja daripada loading blocking */}

            {/* Tampilkan error jika ada */}
            {error && <ErrorMessage message={error} />}
            
            <Input
                label="Nama"
                id="name"
                name="name"
                type="text"
                value={formData.name}
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
                disabled={isEditMode} // Email tidak bisa diubah saat edit
            />
            
            <Input
                label={isEditMode ? "Password (Kosongkan jika tidak diubah)" : "Password"}
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode} // Wajib untuk user baru
            />

            <Select
                label="Role"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={apiLoading} // Disable saat roles sedang loading
            >
                {/* Tampilkan loading saat fetching roles */}
                {apiLoading ? (
                    <option>Loading roles...</option>
                ) : (
                    <>
                        <option value="" disabled>Pilih Role</option>
                        
                        {/* Map dari roleOptions (jika ada dari API) */}
                        {roleOptions.map(role => (
                            <option key={role.role_key} value={role.role_key}>
                                {role.display_name}
                            </option>
                        ))}
                        
                        {/* Fallback jika API gagal (sesuai snippet) */}
                        {roleOptions.length === 0 && !apiLoading && (
                            <>
                                <option value="marketing_staff">Marketing Staff</option>
                                <option value="finance_staff">Finance Staff</option>
                                <option value="hr_staff">HR Staff</option>
                            </>
                        )}
                    </>
                )}
            </Select>

            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={isSubmitting || apiLoading}
                    className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Update User' : 'Tambah User')}
                </button>
            </div>
        </form>
    );
};

export default UserForm;