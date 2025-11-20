// File Location: src/components/forms/JamaahForm.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { Input, Select, Button } from '../common/FormUI';

const JamaahForm = ({ initialData, onSuccess, onCancel }) => {
    const { createJamaah, updateJamaah, getPackages } = useApi();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pkgPricing, setPkgPricing] = useState([]);

    const [formData, setFormData] = useState({
        full_name: '',
        package_id: '',
        selected_room_type: 'Quad',
        gender: 'L',
        birth_date: '',
        passport_number: '',
        phone_number: '',
        address_details: { detail: '', city: '', province: '' },
        document_status: { ktp: false, passport: false, kk: false }
    });

    useEffect(() => {
        getPackages({ status: 'active' }).then(res => setPackages(res || []));
        
        if (initialData) {
            setFormData({
                ...initialData,
                address_details: initialData.address_details || { detail: '', city: '', province: '' },
                document_status: initialData.document_status || { ktp: false, passport: false, kk: false },
                package_id: initialData.package_id || '',
                selected_room_type: initialData.selected_room_type || 'Quad'
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.package_id && packages.length > 0) {
            const selectedPkg = packages.find(p => p.id == formData.package_id);
            if (selectedPkg && selectedPkg.pricing_variants) {
                const variants = typeof selectedPkg.pricing_variants === 'string' 
                    ? JSON.parse(selectedPkg.pricing_variants) 
                    : selectedPkg.pricing_variants;
                setPkgPricing(variants || []);
            }
        }
    }, [formData.package_id, packages]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('addr_')) {
            const field = name.replace('addr_', '');
            setFormData(prev => ({
                ...prev,
                address_details: { ...prev.address_details, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

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
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded space-y-4 h-full overflow-y-auto">
            <h3 className="text-lg font-bold border-b pb-2">Input Data Jamaah</h3>
            
            <div className="bg-blue-50 p-3 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Pilih Paket" name="package_id" value={formData.package_id} onChange={handleChange} required>
                        <option value="">-- Pilih Paket --</option>
                        {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                    <Select label="Tipe Kamar" name="selected_room_type" value={formData.selected_room_type} onChange={handleChange}>
                        {pkgPricing.map((v,i) => <option key={i} value={v.type}>{v.type} - Rp {parseInt(v.price).toLocaleString()}</option>)}
                        {pkgPricing.length === 0 && <option value="Quad">Quad</option>}
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                <Input label="Nama Lengkap" name="full_name" value={formData.full_name} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Paspor" name="passport_number" value={formData.passport_number} onChange={handleChange} />
                    <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Tgl Lahir" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required />
                    <Input label="WhatsApp" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
                </div>
            </div>

            <div className="pt-3 border-t">
                <h4 className="font-semibold text-gray-600 text-sm mb-2">Alamat</h4>
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <Input label="Kota" name="addr_city" value={formData.address_details.city} onChange={handleChange} />
                    <Input label="Provinsi" name="addr_province" value={formData.address_details.province} onChange={handleChange} />
                </div>
                <textarea name="addr_detail" className="w-full border p-2 rounded" placeholder="Alamat Lengkap" rows="2" value={formData.address_details.detail} onChange={e => setFormData(p=>({...p, address_details:{...p.address_details, detail:e.target.value}}))}></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>
                <Button type="submit" disabled={loading}>Simpan Data</Button>
            </div>
        </form>
    );
};

export default JamaahForm;