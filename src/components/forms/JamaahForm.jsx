import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import Loading from '../common/Loading';

const JamaahForm = ({ initialData, onSuccess, onCancel }) => {
    const { createJamaah, updateJamaah, getPackages } = useApi();
    const [loadingData, setLoadingData] = useState(true);
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    
    // --- STATE FORM ---
    const [formData, setFormData] = useState({
        package_id: '',
        selected_room_type: '',
        full_name: '',
        gender: 'L',
        birth_date: '',
        age: 0, // Calculated
        phone_number: '',
        passport_number: '',
        passport_issued_date: '',
        passport_expiry_date: '',
        
        // Alamat & Wilayah
        address_details: {
            provinsi_id: '', provinsi_name: '',
            kota_id: '', kota_name: '',
            kecamatan_id: '', kecamatan_name: '',
            kelurahan_id: '', kelurahan_name: '',
            detail_alamat: ''
        },
        
        // Uploads (URL String dulu)
        files_ktp: '',
        files_kk: '',
        files_passport: '',
        files_meningitis: '',
        
        // Status Check
        document_status: {
            ktp: false, kk: false, passport: false, meningitis: false
        },
        kit_status: 'pending',
        pic_id: '' // Otomatis user login di backend jika kosong, atau pilih sub agent
    });

    // --- WILAYAH STATE ---
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Init Data
    useEffect(() => {
        const init = async () => {
            try {
                const res = await getPackages({ status: 'active' });
                setPackages(res || []);
                
                // Fetch Provinsi
                fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
                    .then(r => r.json())
                    .then(data => setProvinces(data));

                if (initialData) {
                    // Populate Form for Edit
                    setFormData({
                        ...initialData,
                        address_details: typeof initialData.address_details === 'string' ? JSON.parse(initialData.address_details) : initialData.address_details,
                        document_status: typeof initialData.document_status === 'string' ? JSON.parse(initialData.document_status) : initialData.document_status,
                        age: calculateAge(initialData.birth_date)
                    });
                    
                    // Set Selected Package untuk logic harga
                    const pkg = (res || []).find(p => p.id == initialData.package_id);
                    setSelectedPackage(pkg);

                    // Trigger fetch wilayah (bisa dioptimasi nanti)
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingData(false);
            }
        };
        init();
    }, [initialData]);

    // --- LOGIC WILAYAH ---
    const handleRegionChange = (level, id, name) => {
        const newAddr = { ...formData.address_details, [`${level}_id`]: id, [`${level}_name`]: name };
        
        // Reset child levels
        if (level === 'provinsi') {
            newAddr.kota_id = ''; newAddr.kecamatan_id = ''; newAddr.kelurahan_id = '';
            setRegencies([]); setDistricts([]); setVillages([]);
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`).then(r => r.json()).then(setRegencies);
        } else if (level === 'kota') {
            newAddr.kecamatan_id = ''; newAddr.kelurahan_id = '';
            setDistricts([]); setVillages([]);
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`).then(r => r.json()).then(setDistricts);
        } else if (level === 'kecamatan') {
            newAddr.kelurahan_id = '';
            setVillages([]);
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`).then(r => r.json()).then(setVillages);
        }

        setFormData(prev => ({ ...prev, address_details: newAddr }));
    };

    // --- LOGIC LAINNYA ---
    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        const pkg = packages.find(p => p.id == pkgId);
        setSelectedPackage(pkg);
        setFormData(prev => ({ ...prev, package_id: pkgId, selected_room_type: '' }));
    };

    const calculateAge = (dateString) => {
        if (!dateString) return 0;
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setFormData(prev => ({ ...prev, birth_date: date, age: calculateAge(date) }));
    };

    const getPassportExpiryWarning = () => {
        if (!formData.passport_expiry_date) return null;
        const expiry = new Date(formData.passport_expiry_date);
        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);

        if (expiry < today) return <span className="text-red-600 text-xs font-bold block mt-1">⚠ Paspor Sudah Kadaluarsa!</span>;
        if (expiry < sixMonthsLater) return <span className="text-red-600 text-xs font-bold block mt-1">⚠ Segera Perpanjang Paspor (Kurang dari 6 Bulan)</span>;
        return null;
    };

    const getCurrentPrice = () => {
        if (!selectedPackage || !formData.selected_room_type) return 0;
        const variants = selectedPackage.pricing_variants || []; // Sudah didecode di context/API response? pastikan array
        // Backend API harusnya kirim pricing_variants sebagai array object
        // Jika masih string JSON, perlu parse. Asumsi sudah object dari API.
        const variant = variants.find(v => v.type === formData.selected_room_type || v.name === formData.selected_room_type);
        return variant ? variant.price : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (initialData?.id) {
                await updateJamaah(initialData.id, formData);
            } else {
                await createJamaah(formData);
            }
            onSuccess();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    if (loadingData) return <Loading text="Menyiapkan Form..." />;

    return (
        <form onSubmit={handleSubmit} className="bg-white">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Data Jamaah' : 'Registrasi Jamaah Baru'}</h2>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕ Tutup</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* KOLOM 1: DATA PAKET & DATA DIRI */}
                <div className="space-y-4">
                    <h3 className="font-bold text-blue-600 border-b pb-1">1. Paket & Data Diri</h3>
                    
                    <div>
                        <label className="label">Pilih Paket</label>
                        <select className="input-field w-full border p-2 rounded" value={formData.package_id} onChange={handlePackageChange} required disabled={!!initialData}>
                            <option value="">-- Pilih Paket Keberangkatan --</option>
                            {packages.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - {p.departure_date}</option>
                            ))}
                        </select>
                    </div>

                    {selectedPackage && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <div className="text-sm font-bold text-blue-800 mb-2">Pilih Tipe Kamar:</div>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedPackage.pricing_variants && selectedPackage.pricing_variants.map((v, idx) => (
                                    <label key={idx} className={`cursor-pointer border p-2 rounded text-sm flex flex-col items-center ${formData.selected_room_type === v.type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name="room_type" 
                                            value={v.type} 
                                            checked={formData.selected_room_type === v.type}
                                            onChange={(e) => setFormData({...formData, selected_room_type: e.target.value})}
                                            className="hidden"
                                        />
                                        <span className="font-bold">{v.type}</span>
                                        <span>{formatIDR(v.price)}</span>
                                    </label>
                                ))}
                            </div>
                            {formData.selected_room_type && (
                                <div className="mt-2 text-center text-green-700 font-bold text-sm">
                                    Total: {formatIDR(getCurrentPrice())}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="label">Nama Lengkap (Sesuai KTP/Paspor)</label>
                        <input type="text" className="input-field w-full border p-2 rounded uppercase" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jenis Kelamin</label>
                            <select className="input-field w-full border p-2 rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Tanggal Lahir</label>
                            <input type="date" className="input-field w-full border p-2 rounded" value={formData.birth_date} onChange={handleDateChange} required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="label">Umur (Otomatis)</label>
                        <input type="text" className="bg-gray-100 w-full border p-2 rounded cursor-not-allowed" value={`${formData.age} Tahun`} readOnly />
                    </div>

                    <div>
                        <label className="label">No. HP / WhatsApp</label>
                        <input type="text" className="input-field w-full border p-2 rounded" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="08..." required />
                    </div>
                </div>

                {/* KOLOM 2: ALAMAT & PASPOR */}
                <div className="space-y-4">
                    <h3 className="font-bold text-blue-600 border-b pb-1">2. Alamat Domisili & Paspor</h3>
                    
                    {/* Form Wilayah Berjenjang */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500">Provinsi</label>
                            <select className="w-full border p-1 rounded text-sm" 
                                onChange={(e) => handleRegionChange('provinsi', e.target.value, e.target.selectedOptions[0].text)}
                                value={formData.address_details.provinsi_id}>
                                <option value="">Pilih...</option>
                                {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Kab/Kota</label>
                            <select className="w-full border p-1 rounded text-sm"
                                onChange={(e) => handleRegionChange('kota', e.target.value, e.target.selectedOptions[0].text)}
                                value={formData.address_details.kota_id}>
                                <option value="">Pilih...</option>
                                {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Kecamatan</label>
                            <select className="w-full border p-1 rounded text-sm"
                                onChange={(e) => handleRegionChange('kecamatan', e.target.value, e.target.selectedOptions[0].text)}
                                value={formData.address_details.kecamatan_id}>
                                <option value="">Pilih...</option>
                                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Desa/Kel</label>
                            <select className="w-full border p-1 rounded text-sm"
                                onChange={(e) => handleRegionChange('kelurahan', e.target.value, e.target.selectedOptions[0].text)}
                                value={formData.address_details.kelurahan_id}>
                                <option value="">Pilih...</option>
                                {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Alamat Lengkap (Jalan, RT/RW)</label>
                        <textarea className="w-full border p-2 rounded" rows="2" 
                            value={formData.address_details.detail_alamat} 
                            onChange={e => setFormData(prev => ({...prev, address_details: {...prev.address_details, detail_alamat: e.target.value}}))}
                            placeholder="Jl. Merdeka No. 1, RT 01/RW 02..."
                        ></textarea>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mt-4">
                        <h4 className="font-bold text-yellow-800 text-sm mb-2">Data Paspor</h4>
                        <div className="space-y-2">
                            <input type="text" placeholder="Nomor Paspor" className="w-full border p-2 rounded" value={formData.passport_number} onChange={e => setFormData({...formData, passport_number: e.target.value})} />
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs">Tgl Issued</label>
                                    <input type="date" className="w-full border p-2 rounded text-sm" value={formData.passport_issued_date} onChange={e => setFormData({...formData, passport_issued_date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs">Tgl Expired</label>
                                    <input type="date" className="w-full border p-2 rounded text-sm" value={formData.passport_expiry_date} onChange={e => setFormData({...formData, passport_expiry_date: e.target.value})} />
                                </div>
                            </div>
                            {getPassportExpiryWarning()}
                        </div>
                    </div>
                </div>

                {/* KOLOM 3: DOKUMEN & LAINNYA */}
                <div className="space-y-4">
                    <h3 className="font-bold text-blue-600 border-b pb-1">3. Dokumen & Perlengkapan</h3>
                    
                    <div className="space-y-3">
                        {[
                            { key: 'files_ktp', label: 'Foto KTP', statusKey: 'ktp' },
                            { key: 'files_kk', label: 'Foto KK', statusKey: 'kk' },
                            { key: 'files_passport', label: 'Scan Paspor', statusKey: 'passport' },
                            { key: 'files_meningitis', label: 'Buku Meningitis', statusKey: 'meningitis' }
                        ].map(doc => (
                            <div key={doc.key} className="border p-3 rounded bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold">{doc.label}</label>
                                    {/* Checkbox Status Hijau */}
                                    <label className="flex items-center space-x-1 text-xs cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.document_status[doc.statusKey]} 
                                            onChange={e => setFormData(prev => ({
                                                ...prev, 
                                                document_status: {...prev.document_status, [doc.statusKey]: e.target.checked}
                                            }))}
                                            className="form-checkbox text-green-600 h-4 w-4"
                                        />
                                        <span className={formData.document_status[doc.statusKey] ? 'text-green-600 font-bold' : 'text-gray-500'}>
                                            {formData.document_status[doc.statusKey] ? 'Sudah Ada' : 'Belum'}
                                        </span>
                                    </label>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Paste URL File / Upload (Coming Soon)" 
                                    className="w-full border p-1 text-sm rounded mb-1"
                                    value={formData[doc.key]}
                                    onChange={e => setFormData({...formData, [doc.key]: e.target.value})}
                                />
                                {formData[doc.key] && (
                                    <a href={formData[doc.key]} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                                        👁 Lihat Preview
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="label">Status Perlengkapan (Koper/Batik)</label>
                        <select className="input-field w-full border p-2 rounded" value={formData.kit_status} onChange={e => setFormData({...formData, kit_status: e.target.value})}>
                            <option value="pending">Belum Dikirim</option>
                            <option value="sent">Sudah Dikirim</option>
                            <option value="received">Sudah Diterima Jamaah</option>
                        </select>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 flex flex-col space-y-2">
                         <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-lg">
                             {initialData ? 'Simpan Perubahan' : 'Daftarkan Jamaah'}
                         </button>
                         <button type="button" onClick={onCancel} className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                             Batal
                         </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default JamaahForm;