import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useApi } from '../../context/ApiContext';
import FormUI from '../common/FormUI';

export default function UserForm({ initialData, onSubmit, onCancel }) {
    const { api } = useApi();
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm();
    
    const selectedRole = watch('role'); // Pantau perubahan Role

    const [branches, setBranches] = useState([]);
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        // Load Data Cabang & Agen untuk dropdown
        api.get('/branches').then(res => setBranches(res || []));
        api.get('/sub-agents').then(res => setAgents(res || []));
    }, []);

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({ role: 'staff', status: 'active' });
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-4">
                <h3 className="font-bold text-yellow-800 text-sm mb-1">Hak Akses & Peran</h3>
                <p className="text-xs text-yellow-700">
                    Tentukan peran pengguna. Jika Anda memilih <strong>Agen</strong> atau <strong>Kepala Cabang</strong>, 
                    Anda wajib menghubungkannya dengan data Agen/Cabang yang sesuai agar data mereka terfilter otomatis.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormUI.Input
                    label="Nama Lengkap"
                    {...register('full_name', { required: 'Nama wajib diisi' })}
                    error={errors.full_name}
                />
                <FormUI.Input
                    label="Email (Untuk Login)"
                    type="email"
                    {...register('email', { required: 'Email wajib diisi' })}
                    error={errors.email}
                />
                <FormUI.Input
                    label="Password"
                    type="password"
                    {...register('password', { required: !initialData && 'Password wajib diisi' })}
                    placeholder={initialData ? 'Kosongkan jika tidak ubah' : ''}
                    error={errors.password}
                />
                <FormUI.Input
                    label="No. Telepon"
                    {...register('phone')}
                />
            </div>

            <div className="border-t pt-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormUI.Select
                        label="Role / Peran"
                        {...register('role', { required: true })}
                        options={[
                            { value: 'super_admin', label: 'Super Admin (Akses Penuh)' },
                            { value: 'owner', label: 'Owner (Pemilik)' },
                            { value: 'staff', label: 'Staff Admin Pusat' },
                            { value: 'branch_manager', label: 'Kepala Cabang' },
                            { value: 'agent', label: 'Agen Travel' },
                        ]}
                    />

                    {/* Input Kondisional berdasarkan Role */}
                    
                    {selectedRole === 'branch_manager' && (
                        <div className="animate-fade-in">
                            <FormUI.Select
                                label="Pilih Cabang yang Dikelola"
                                {...register('linked_branch_id', { required: 'Pilih cabang' })}
                                options={[
                                    { value: '', label: '-- Pilih Cabang --' },
                                    ...branches.map(b => ({ value: b.id, label: b.name }))
                                ]}
                                error={errors.linked_branch_id}
                            />
                            <p className="text-xs text-gray-500 mt-1">User ini hanya akan melihat data di cabang ini.</p>
                        </div>
                    )}

                    {selectedRole === 'agent' && (
                        <div className="animate-fade-in">
                            <FormUI.Select
                                label="Hubungkan dengan Data Agen"
                                {...register('linked_agent_id', { required: 'Pilih agen' })}
                                options={[
                                    { value: '', label: '-- Pilih Nama Agen --' },
                                    ...agents.map(a => ({ value: a.id, label: a.name }))
                                ]}
                                error={errors.linked_agent_id}
                            />
                            <p className="text-xs text-gray-500 mt-1">User ini hanya akan melihat jemaah yang dia daftarkan.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <FormUI.Button variant="secondary" onClick={onCancel} type="button">Batal</FormUI.Button>
                <FormUI.Button type="submit">Simpan Pengguna</FormUI.Button>
            </div>
        </form>
    );
}