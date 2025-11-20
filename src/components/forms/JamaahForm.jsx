import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import Loading from '../common/Loading';

const JamaahForm = ({ initialData, onSuccess, onCancel }) => {
    const { createJamaah, updateJamaah, getPackages } = useApi();
    const [packages, setPackages] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        package_id: '',
        passport_number: '',
        phone_number: '',
        address_details: {
            provinsi_id: '', provinsi_name: '',
            kota_id: '', kota_name: '',
            detail_alamat: ''
        },
        ...initialData // Override defaults if edit
    });

    useEffect(() => {
        // Fetch Packages
        getPackages({ status: 'active' }).then(res => setPackages(res || []));
        
        // Fetch Provinces (API Publik Indonesia)
        fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(err => console.error("Gagal ambil provinsi", err));

        // Jika Edit Mode, load data kota berdasarkan provinsi yang tersimpan
        if (initialData?.address_details?.provinsi_id) {
             fetchRegencies(initialData.address_details.provinsi_id);
        }
    }, [initialData]);

    const fetchRegencies = (provId) => {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`)
            .then(res => res.json())
            .then(data => setRegencies(data));
    };

    const handleProvinceChange = (e) => {
        const provId = e.target.value;
        const provName = e.target.options[e.target.selectedIndex].text;
        setFormData(prev => ({
            ...prev, 
            address_details: { ...prev.address_details, provinsi_id: provId, provinsi_name: provName, kota_id: '' }
        }));
        fetchRegencies(provId);
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
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{initialData ? 'Edit Jamaah' : 'Daftar Jamaah Baru'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Nama Lengkap</label>
                    <input type="text" required className="input-field" 
                        value={formData.full_name} 
                        onChange={e => setFormData({...formData, full_name: e.target.value})} 
                    />
                </div>
                <div>
                    <label className="label">Paket</label>
                    <select required className="input-field"
                        value={formData.package_id}
                        onChange={e => setFormData({...formData, package_id: e.target.value})}>
                        <option value="">Pilih Paket</option>
                        {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Provinsi</label>
                    <select className="input-field" onChange={handleProvinceChange} value={formData.address_details?.provinsi_id}>
                        <option value="">Pilih Provinsi</option>
                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label">Kota/Kabupaten</label>
                    <select className="input-field" 
                        onChange={e => setFormData({
                            ...formData, 
                            address_details: {...formData.address_details, kota_id: e.target.value, kota_name: e.target.options[e.target.selectedIndex].text}
                        })}
                        value={formData.address_details?.kota_id}>
                        <option value="">Pilih Kota</option>
                        {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
};

export default JamaahForm;