import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApi } from '../../context/ApiContext';
import FormUI from '../common/FormUI'; 

export default function JamaahForm({ initialData, onSubmit, onCancel }) {
    const { api } = useApi();
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    
    // State untuk data dropdown
    const [packages, setPackages] = useState([]);
    const [agents, setAgents] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // State untuk Mahram Search
    const [mahramQuery, setMahramQuery] = useState('');
    const [mahramResults, setMahramResults] = useState([]);
    const [selectedMahram, setSelectedMahram] = useState(null);

    // Fetch Data untuk Dropdown saat komponen dimuat
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                // Gunakan Promise.all agar loading paralel
                const [pkgData, agentData, branchData] = await Promise.all([
                    api.get('/packages').catch(() => []),
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
    }, []);

    // Reset form saat initialData berubah (Mode Edit)
    useEffect(() => {
        if (initialData) {
            const formattedData = { ...initialData };
            
            // Format tanggal agar sesuai input type="date"
            ['birth_date', 'passport_issued', 'passport_expiry'].forEach(field => {
                if (formattedData[field]) formattedData[field] = formattedData[field].split('T')[0];
            });
            
            reset(formattedData);

            // Jika ada mahram_id, fetch namanya untuk display
            if (formattedData.mahram_id && formattedData.mahram_id !== '0') {
                // Kita fetch detail jamaah mahram untuk menampilkan namanya
                api.get(`/jamaah/${formattedData.mahram_id}`).then(res => {
                    if(res && res.id) {
                        setSelectedMahram({ id: res.id, full_name: res.full_name });
                    }
                }).catch(e => console.log("Mahram not found", e));
            }
        } else {
            reset({
                full_name: '', nik: '', gender: 'L', phone_number: '',
                passport_number: '', passport_issued: '', passport_expiry: '', birth_date: '',
                address_details: '', package_id: '', sub_agent_id: '', branch_id: '',
                status: 'registered', relation: ''
            });
            setSelectedMahram(null);
        }
    }, [initialData, reset]);

    // Search Mahram Logic (Debounce sederhana)
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (mahramQuery.length > 2) {
                try {
                    const res = await api.get(`/jamaah/search?q=${mahramQuery}`);
                    setMahramResults(res || []);
                } catch(e) { console.error(e); }
            } else {
                setMahramResults([]);
            }
        }, 500); // Tunggu 500ms setelah ketik
        return () => clearTimeout(timeoutId);
    }, [mahramQuery]);


    const onFormSubmit = (data) => {
        const payload = {
            ...data,
            package_id: data.package_id ? parseInt(data.package_id) : 0,
            sub_agent_id: data.sub_agent_id ? parseInt(data.sub_agent_id) : 0,
            branch_id: data.branch_id ? parseInt(data.branch_id) : 0,
            mahram_id: selectedMahram ? parseInt(selectedMahram.id) : 0, // Tambahkan Mahram ID
            // Relation sudah ada di data karena ter-register
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 h-[75vh] overflow-y-auto px-2 pb-10">
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
                        label="NIK"
                        {...register('nik', { 
                            required: 'NIK wajib diisi',
                            minLength: { value: 16, message: '16 digit' }
                        })}
                        error={errors.nik}
                        placeholder="16 Digit Angka"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <FormUI.Select
                            label="Jenis Kelamin"
                            {...register('gender', { required: 'Pilih jenis kelamin' })}
                            options={[{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }]}
                            error={errors.gender}
                        />
                         <FormUI.Input
                            label="Tanggal Lahir"
                            type="date"
                            {...register('birth_date', { required: 'Wajib diisi' })}
                            error={errors.birth_date}
                        />
                    </div>

                    <FormUI.Input
                        label="Nomor Telepon / WA"
                        {...register('phone_number', { required: 'No HP wajib diisi' })}
                        error={errors.phone_number}
                        placeholder="0812..."
                    />
                </div>
                
                <div className="mt-4">
                    <FormUI.TextArea
                        label="Alamat Lengkap"
                        {...register('address_details')}
                        rows={2}
                        placeholder="Alamat lengkap..."
                    />
                </div>
            </div>

             {/* Section 2: Mahram & Keluarga (BARU) */}
             <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 mb-4 border-b border-blue-200 pb-2">Mahram & Keluarga</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Input Pencarian Mahram */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Mahram (Jika ada)</label>
                        {selectedMahram ? (
                            <div className="flex items-center justify-between bg-white p-2 border border-blue-300 rounded shadow-sm">
                                <span className="font-medium text-blue-800">{selectedMahram.full_name}</span>
                                <button type="button" onClick={() => setSelectedMahram(null)} className="text-red-500 hover:text-red-700 text-sm font-bold px-2">X Hapus</button>
                            </div>
                        ) : (
                            <input 
                                type="text" 
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Ketik nama jamaah lain..."
                                value={mahramQuery}
                                onChange={e => setMahramQuery(e.target.value)}
                            />
                        )}
                        
                        {/* Hasil Pencarian Dropdown */}
                        {!selectedMahram && mahramResults.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {mahramResults.map(m => (
                                    <li key={m.id} 
                                        onClick={() => { setSelectedMahram(m); setMahramResults([]); setMahramQuery(''); }}
                                        className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                                    >
                                        {m.full_name} <span className="text-gray-400 text-xs">({m.passport_number || 'No Pass'})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Cari nama jamaah yang sudah terdaftar untuk dijadikan mahram.</p>
                    </div>

                    <FormUI.Select
                        label="Hubungan Keluarga"
                        {...register('relation')}
                        options={[
                            { value: '', label: '- Pilih Hubungan -' },
                            { value: 'Suami', label: 'Suami' },
                            { value: 'Istri', label: 'Istri' },
                            { value: 'Ayah', label: 'Ayah' },
                            { value: 'Ibu', label: 'Ibu' },
                            { value: 'Anak', label: 'Anak' },
                            { value: 'Saudara', label: 'Saudara Kandung' },
                            { value: 'Lainnya', label: 'Lainnya' }
                        ]}
                        disabled={!selectedMahram} // Disable jika belum pilih mahram
                    />
                </div>
            </div>

            {/* Section 3: Data Paspor & Paket */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Dokumen & Layanan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormUI.Input label="Nomor Paspor" {...register('passport_number')} placeholder="X1234567" />
                    <FormUI.Input label="Tgl Terbit" type="date" {...register('passport_issued')} />
                    <FormUI.Input label="Tgl Expired" type="date" {...register('passport_expiry')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormUI.Select
                        label="Pilih Paket Umrah"
                        {...register('package_id')}
                        options={[
                            { value: '', label: '-- Pilih Paket --' },
                            ...packages.map(p => ({ value: p.id, label: `${p.name} (${new Date(p.departure_date).toLocaleDateString('id-ID')})` }))
                        ]}
                    />
                    
                    <FormUI.Select
                        label="Kantor Cabang"
                        {...register('branch_id')}
                        options={[
                            { value: '', label: '-- Pilih Cabang --' },
                            ...branches.map(b => ({ value: b.id, label: `${b.name} (${b.city})` }))
                        ]}
                    />

                    <FormUI.Select
                        label="Agen / Sponsor"
                        {...register('sub_agent_id')}
                        options={[
                            { value: '', label: '-- Tanpa Agen --' },
                            ...agents.map(a => ({ value: a.id, label: a.name }))
                        ]}
                    />

                    <FormUI.Select
                        label="Status Pendaftaran"
                        {...register('status')}
                        options={[
                            { value: 'lead', label: 'Lead / Prospek' },
                            { value: 'registered', label: 'Terdaftar' },
                            { value: 'active', label: 'Aktif (Lengkap)' },
                            { value: 'completed', label: 'Selesai' },
                            { value: 'cancelled', label: 'Batal' }
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