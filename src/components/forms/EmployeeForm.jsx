import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormUI from '../common/FormUI';

const AVAILABLE_FEATURES = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'packages', label: 'Manajemen Paket' },
    { id: 'jamaah', label: 'Data Jamaah' },
    { id: 'transactions', label: 'Transaksi & Keuangan' },
    { id: 'rooming', label: 'Rooming List' },
    { id: 'marketing', label: 'Marketing & Leads' },
    { id: 'hr', label: 'HR & Karyawan' },
    { id: 'settings', label: 'Pengaturan Sistem' },
];

export default function EmployeeForm({ initialData, onSubmit, onCancel, isLoading }) {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        defaultValues: {
            name: '',
            position: '',
            phone: '',
            email: '',
            salary: '',
            status: 'active',
            access_permissions: []
        }
    });

    // State lokal untuk handle checkbox manual (karena array checkbox kadang tricky di useForm simple)
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        if (initialData) {
            Object.keys(initialData).forEach(key => {
                // Khusus permission, parse jika perlu atau pakai langsung jika array
                if (key === 'access_permissions') {
                    const perms = Array.isArray(initialData[key]) ? initialData[key] : [];
                    setSelectedPermissions(perms);
                } else {
                    setValue(key, initialData[key]);
                }
            });
        }
    }, [initialData, setValue]);

    const handlePermissionChange = (featureId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId);
            } else {
                return [...prev, featureId];
            }
        });
    };

    const onFormSubmit = (data) => {
        // Gabungkan data form dengan permission yang dipilih
        const finalData = {
            ...data,
            access_permissions: selectedPermissions
        };
        onSubmit(finalData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informasi Dasar */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informasi Pegawai</h3>
                    
                    <FormUI.Input
                        label="Nama Lengkap"
                        {...register('name', { required: 'Nama wajib diisi' })}
                        error={errors.name}
                    />
                    
                    <FormUI.Input
                        label="Posisi / Jabatan"
                        {...register('position', { required: 'Posisi wajib diisi' })}
                        error={errors.position}
                    />

                    <FormUI.Input
                        label="Email"
                        type="email"
                        {...register('email', { required: 'Email wajib diisi' })}
                        error={errors.email}
                    />

                    <FormUI.Input
                        label="Nomor Telepon"
                        {...register('phone')}
                        error={errors.phone}
                    />

                    <FormUI.Input
                        label="Gaji (Rp)"
                        type="number"
                        {...register('salary')}
                        error={errors.salary}
                    />

                    <FormUI.Select
                        label="Status Karyawan"
                        {...register('status')}
                        options={[
                            { value: 'active', label: 'Aktif' },
                            { value: 'inactive', label: 'Tidak Aktif' }
                        ]}
                    />
                </div>

                {/* Hak Akses Sistem */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Hak Akses Sistem</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Pilih fitur apa saja yang dapat diakses oleh karyawan ini.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2 bg-gray-50 p-4 rounded-lg border">
                        {AVAILABLE_FEATURES.map(feature => (
                            <label key={feature.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    checked={selectedPermissions.includes(feature.id)}
                                    onChange={() => handlePermissionChange(feature.id)}
                                />
                                <span className="text-gray-700 font-medium">{feature.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <FormUI.Button variant="secondary" onClick={onCancel} type="button">
                    Batal
                </FormUI.Button>
                <FormUI.Button type="submit" isLoading={isLoading}>
                    {initialData ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </FormUI.Button>
            </div>
        </form>
    );
}