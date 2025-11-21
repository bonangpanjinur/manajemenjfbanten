import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApi } from '../../context/ApiContext';
import FormUI from '../common/FormUI'; 

export default function JamaahForm({ initialData, onSubmit, onCancel }) {
    const { api } = useApi();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    
    // State untuk data dropdown
    const [packages, setPackages] = useState([]);
    const [agents, setAgents] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch Data untuk Dropdown saat komponen dimuat
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                // Gunakan Promise.all agar loading paralel
                const [pkgData, agentData, branchData] = await Promise.all([
                    api.get('/packages').catch(() => []),   // Fallback ke array kosong jika error
                    api.get('/sub-agents').catch(() => []),
                    api.get('/branches').catch(() => [])
                ]);
                setPackages(pkgData || []);
                setAgents(agentData || []);
                setBranches(branchData || []);
            } catch (err) {
                console.error("Gagal memuat data master:", err);
            } finally {
                setLoadingData(false);
            }
        };
        loadMasterData();
    }, []); // Empty dependency array = run once

    // Reset form saat initialData berubah (Mode Edit)
    useEffect(() => {
        if (initialData) {
            // Clone data agar tidak mengubah props asli
            const formattedData = { ...initialData };
            
            // Format tanggal agar sesuai dengan input type="date" (YYYY-MM-DD)
            ['birth_date', 'passport_issued', 'passport_expiry'].forEach(field => {
                if (formattedData[field]) {
                    // Ambil bagian tanggal saja dari format ISO (misal: 2023-10-25T00:00:00 -> 2023-10-25)
                    formattedData[field] = formattedData[field].split('T')[0];
                }
            });
            
            reset(formattedData);
        } else {
            // Reset ke default values untuk form baru
            reset({
                full_name: '',
                nik: '',
                gender: 'L',
                phone_number: '',
                passport_number: '',
                passport_issued: '',
                passport_expiry: '',
                birth_date: '',
                address_details: '',
                package_id: '',
                sub_agent_id: '',
                branch_id: '',
                status: 'registered'
            });
        }
    }, [initialData, reset]);

    const onFormSubmit = (data) => {
        // Pastikan ID dikirim sebagai integer jika ada nilai
        const payload = {
            ...data,
            package_id: data.package_id ? parseInt(data.package_id) : 0,
            sub_agent_id: data.sub_agent_id ? parseInt(data.sub_agent_id) : 0,
            branch_id: data.branch_id ? parseInt(data.branch_id) : 0
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Section 1: Data Pribadi */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Data Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormUI.Input
                        label="Nama Lengkap (Sesuai KTP/Paspor)"
                        {...register('full_name', { required: 'Nama wajib diisi' })}
                        error={errors.full_name}
                        placeholder="Contoh: AHMAD SYAFIQ"
                    />
                    
                    <FormUI.Input
                        label="Nomor Induk Kependudukan (NIK)"
                        {...register('nik', { 
                            required: 'NIK wajib diisi',
                            minLength: { value: 16, message: 'NIK harus 16 digit' },
                            pattern: { value: /^[0-9]+$/, message: 'NIK harus berupa angka' }
                        })}
                        error={errors.nik}
                        placeholder="16 Digit Angka"
                    />

                    <FormUI.Select
                        label="Jenis Kelamin"
                        {...register('gender', { required: 'Pilih jenis kelamin' })}
                        options={[
                            { value: 'L', label: 'Laki-laki' },
                            { value: 'P', label: 'Perempuan' }
                        ]}
                        error={errors.gender}
                    />

                    <FormUI.Input
                        label="Tanggal Lahir"
                        type="date"
                        {...register('birth_date', { required: 'Tanggal lahir wajib diisi' })}
                        error={errors.birth_date}
                    />

                    <FormUI.Input
                        label="Nomor Telepon / WhatsApp"
                        {...register('phone_number', { required: 'No HP wajib diisi' })}
                        error={errors.phone_number}
                        placeholder="0812..."
                    />
                </div>
                
                <div className="mt-4">
                    {/* Perbaikan: Menggunakan TextArea (A Besar) */}
                    <FormUI.TextArea
                        label="Alamat Lengkap (Sesuai KTP)"
                        {...register('address_details')}
                        rows={3}
                        placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
                        error={errors.address_details}
                    />
                </div>
            </div>

            {/* Section 2: Data Paspor */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Dokumen Paspor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormUI.Input
                        label="Nomor Paspor"
                        {...register('passport_number')}
                        placeholder="X1234567"
                    />
                    <FormUI.Input
                        label="Tanggal Terbit"
                        type="date"
                        {...register('passport_issued')}
                    />
                    <FormUI.Input
                        label="Tanggal Habis Berlaku"
                        type="date"
                        {...register('passport_expiry')}
                    />
                </div>
            </div>

            {/* Section 3: Layanan & Relasi */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Layanan & Afiliasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Paket Dropdown */}
                    <FormUI.Select
                        label="Pilih Paket Umrah"
                        {...register('package_id')}
                        options={[
                            { value: '', label: '-- Pilih Paket --' },
                            ...packages.map(p => ({ value: p.id, label: `${p.name} (${new Date(p.departure_date).toLocaleDateString('id-ID')})` }))
                        ]}
                    />
                    
                    {/* Cabang Dropdown */}
                    <FormUI.Select
                        label="Kantor Cabang"
                        {...register('branch_id')}
                        options={[
                            { value: '', label: '-- Pilih Cabang --' },
                            ...branches.map(b => ({ value: b.id, label: `${b.name} (${b.city})` }))
                        ]}
                    />

                    {/* Agen Dropdown */}
                    <FormUI.Select
                        label="Agen / Sponsor / Referensi"
                        {...register('sub_agent_id')}
                        options={[
                            { value: '', label: '-- Tanpa Agen (Langsung) --' },
                            ...agents.map(a => ({ value: a.id, label: a.name }))
                        ]}
                    />

                    <FormUI.Select
                        label="Status Pendaftaran"
                        {...register('status')}
                        options={[
                            { value: 'lead', label: 'Lead / Prospek (Belum Pasti)' },
                            { value: 'registered', label: 'Terdaftar (Booking)' },
                            { value: 'active', label: 'Aktif (Siap Berangkat/Lunas)' },
                            { value: 'completed', label: 'Selesai (Sudah Pulang)' },
                            { value: 'cancelled', label: 'Batal / Cancel' }
                        ]}
                    />
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
                <FormUI.Button variant="secondary" onClick={onCancel} type="button">
                    Batal
                </FormUI.Button>
                <FormUI.Button type="submit" isLoading={loadingData}>
                    {initialData ? 'Simpan Perubahan' : 'Daftarkan Jamaah'}
                </FormUI.Button>
            </div>
        </form>
    );
}