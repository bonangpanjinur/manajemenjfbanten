// File: src/components/forms/JamaahForm.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { Input, Select, Textarea } from '../common/FormUI';
import { FaEye, FaUpload } from 'react-icons/fa';

const JamaahForm = ({ initialData, onSuccess, onCancel }) => {
    const { createJamaah, updateJamaah, getPackages } = useApi();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pkgPricing, setPkgPricing] = useState([]);

    // State Form Data
    const [formData, setFormData] = useState({
        full_name: '',
        package_id: '',
        selected_room_type: '',
        package_price: 0,
        gender: 'L',
        birth_date: '',
        age: '', 
        passport_number: '',
        passport_issued: '',
        passport_expiry: '',
        phone_number: '',
        address_details: { detail: '', city: '', province: '' },
        document_status: { ktp: false, passport: false, kk: false, meningitis: false },
        files: { ktp: '', passport: '', kk: '', meningitis: '' }, // Menyimpan URL/Path file
        pic_id: '',
    });

    // Load Paket saat pertama kali render
    useEffect(() => {
        getPackages({ status: 'active' })
            .then(res => setPackages(res || []))
            .catch(err => console.error("Gagal load paket:", err));
        
        if (initialData) {
            setFormData({
                ...initialData,
                address_details: initialData.address_details || { detail: '', city: '', province: '' },
                document_status: initialData.document_status || { ktp: false, passport: false, kk: false, meningitis: false },
                age: calculateAge(initialData.birth_date)
            });
        }
    }, [initialData]);

    // Logic: Ketika Paket dipilih -> Load Varian Harga
    useEffect(() => {
        if (formData.package_id && packages.length > 0) {
            const selectedPkg = packages.find(p => p.id == formData.package_id);
            if (selectedPkg) {
                // Parsing JSON pricing jika diperlukan
                const variants = typeof selectedPkg.pricing_variants === 'string' 
                    ? JSON.parse(selectedPkg.pricing_variants) 
                    : selectedPkg.pricing_variants;
                setPkgPricing(variants || []);
            }
        }
    }, [formData.package_id, packages]);

    // Logic: Ketika Tipe Kamar dipilih -> Set Harga Paket Otomatis
    useEffect(() => {
        if (formData.selected_room_type && pkgPricing.length > 0) {
            const variant = pkgPricing.find(v => v.type === formData.selected_room_type);
            if (variant) {
                setFormData(prev => ({ ...prev, package_price: variant.price }));
            }
        }
    }, [formData.selected_room_type, pkgPricing]);

    // Helper: Hitung Umur
    const calculateAge = (birthDate) => {
        if(!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Helper: Cek Expired Paspor (6 Bulan)
    const checkPassportExpiry = (expiryDate) => {
        if (!expiryDate) return null;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const sixMonths = 180;
        
        if (diffDays < 0) return <span className="text-red-600 text-xs block mt-1 font-medium">⚠️ Paspor Sudah Kedaluwarsa!</span>;
        if (diffDays < sixMonths) return <span className="text-red-600 text-xs block mt-1 font-medium">⚠️ Paspor akan expired {'<'} 6 bulan. Segera perpanjang.</span>;
        return null;
    };

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('addr_')) {
            const field = name.replace('addr_', '');
            setFormData(prev => ({
                ...prev,
                address_details: { ...prev.address_details, [field]: value }
            }));
        } else if (name === 'birth_date') {
            setFormData(prev => ({ ...prev, birth_date: value, age: calculateAge(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateJamaah(initialData.id, formData);
            } else {
                await createJamaah(formData);
            }
            onSuccess();
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-bold text-gray-800">
                    {initialData ? 'Edit Data Jamaah' : 'Input Jamaah Baru'}
                </h3>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
                    ✕
                </button>
            </div>
            
            {/* BAGIAN 1: PILIH PAKET & HARGA */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-blue-800 font-bold mb-3 text-sm uppercase tracking-wide">1. Detail Paket & Kamar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Pilih Paket Keberangkatan" name="package_id" value={formData.package_id} onChange={handleChange} required>
                        <option value="">-- Cari Paket --</option>
                        {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.departure_date})</option>)}
                    </Select>
                    
                    <div>
                        <Select label="Tipe Kamar (Varian)" name="selected_room_type" value={formData.selected_room_type} onChange={handleChange} required disabled={!formData.package_id}>
                            <option value="">-- Pilih Tipe Kamar --</option>
                            {pkgPricing.map((v,i) => (
                                <option key={i} value={v.type}>{v.type} - Rp {parseInt(v.price).toLocaleString('id-ID')}</option>
                            ))}
                        </Select>
                        {formData.package_price > 0 && (
                            <div className="mt-2 p-2 bg-white rounded border border-green-200 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Harga Deal:</span>
                                <span className="text-sm font-bold text-green-700">
                                    Rp {parseInt(formData.package_price).toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BAGIAN 2: DATA DIRI */}
            <div className="space-y-4 border-t pt-4">
                <h4 className="text-gray-800 font-bold text-sm uppercase tracking-wide">2. Data Diri Jamaah</h4>
                <Input label="Nama Lengkap (Sesuai Paspor)" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Contoh: MUHAMMAD ABDULLAH" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Jenis Kelamin" name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </Select>
                    
                    <div className="flex gap-2 items-end">
                        <div className="w-2/3">
                            <Input label="Tanggal Lahir" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required />
                        </div>
                        <div className="w-1/3">
                             <Input label="Umur" value={formData.age ? `${formData.age} Thn` : ''} readOnly className="bg-gray-100 text-center font-bold text-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="No. WhatsApp" name="phone_number" value={formData.phone_number} onChange={handleChange} required placeholder="0812xxx" />
                    <Input label="Kota Asal" name="addr_city" value={formData.address_details.city} onChange={handleChange} placeholder="Contoh: Serang" />
                </div>
                 <Textarea label="Alamat Lengkap (KTP)" name="addr_detail" value={formData.address_details.detail} onChange={handleChange} rows={2} placeholder="Nama Jalan, RT/RW, Kelurahan, Kecamatan..." />
            </div>

             {/* BAGIAN 3: PASPOR */}
             <div className="space-y-4 border-t pt-4">
                <h4 className="text-gray-800 font-bold text-sm uppercase tracking-wide">3. Data Paspor</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Nomor Paspor" name="passport_number" value={formData.passport_number} onChange={handleChange} placeholder="X000000" />
                    <Input label="Tanggal Issued" type="date" name="passport_issued" value={formData.passport_issued} onChange={handleChange} />
                    <div>
                        <Input label="Tanggal Expired" type="date" name="passport_expiry" value={formData.passport_expiry} onChange={handleChange} />
                        {checkPassportExpiry(formData.passport_expiry)}
                    </div>
                </div>
            </div>

            {/* BAGIAN 4: STATUS DOKUMEN */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h4 className="text-gray-800 font-bold mb-3 text-sm uppercase tracking-wide">4. Kelengkapan Dokumen</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['ktp', 'kk', 'passport', 'meningitis'].map((docType) => (
                        <div key={docType} className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition cursor-pointer">
                            <p className="text-xs font-bold uppercase mb-2 text-gray-600">{docType}</p>
                            {formData.document_status[docType] ? (
                                <div className="text-green-600 flex flex-col items-center animate-pulse">
                                    <span className="text-2xl mb-1">✅</span>
                                    <span className="text-[10px] font-bold">TERUPLOAD</span>
                                    <button type="button" className="text-blue-500 text-[10px] flex items-center gap-1 mt-1 hover:underline">
                                        <FaEye /> Lihat
                                    </button>
                                </div>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <FaUpload className="text-xl mb-1" />
                                    <span className="text-[10px]">Belum Ada</span>
                                    <span className="text-[10px] text-blue-500 mt-1">Klik Upload</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition">
                    Batal
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2 disabled:opacity-70">
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan Data Jamaah'
                    )}
                </button>
            </div>
        </form>
    );
};

export default JamaahForm;