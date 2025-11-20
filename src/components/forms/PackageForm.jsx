// File: src/components/forms/PackageForm.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import Loading from '../common/Loading';

const PackageForm = ({ initialData, onSuccess, onCancel }) => {
    const { createPackage, updatePackage, getMasterData, getCategories } = useApi();
    const [loadingData, setLoadingData] = useState(true);
    
    const [airlines, setAirlines] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        sub_category_id: '',
        departure_date: '',
        airline_id: '',
        status: 'active',
        itinerary_file: '',
        hotels: [], 
        pricing_variants: [{ type: 'Quad', price: 0, currency: 'IDR' }] 
    });

    useEffect(() => {
        Promise.all([
            getMasterData('airline'),
            getMasterData('hotel'),
            getCategories()
        ]).then(([resAir, resHotel, resCat]) => {
            setAirlines(resAir || []);
            setHotels(resHotel || []);
            setCategories(resCat || []);
            setLoadingData(false);

            if (initialData) {
                setFormData({
                    ...initialData,
                    hotels: Array.isArray(initialData.hotels) ? initialData.hotels : JSON.parse(initialData.hotels || '[]'),
                    pricing_variants: Array.isArray(initialData.pricing_variants) ? initialData.pricing_variants : JSON.parse(initialData.pricing_variants || '[]')
                });
            }
        }).catch(err => {
            console.error(err);
            setLoadingData(false);
        });
    }, [initialData]);

    const handleVariantChange = (idx, field, value) => {
        const newVariants = [...formData.pricing_variants];
        newVariants[idx][field] = value;
        setFormData(prev => ({ ...prev, pricing_variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev, 
            pricing_variants: [...prev.pricing_variants, { type: '', price: 0, currency: 'IDR' }]
        }));
    };

    const removeVariant = (idx) => {
        const newVariants = formData.pricing_variants.filter((_, i) => i !== idx);
        setFormData(prev => ({ ...prev, pricing_variants: newVariants }));
    };

    const toggleHotel = (id) => {
        const hotelId = parseInt(id);
        setFormData(prev => {
            const newHotels = prev.hotels.includes(hotelId)
                ? prev.hotels.filter(h => h !== hotelId)
                : [...prev.hotels, hotelId];
            return { ...prev, hotels: newHotels };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (initialData?.id) await updatePackage(initialData.id, formData);
            else await createPackage(formData);
            onSuccess();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loadingData) return <Loading text="Memuat Data..." />;

    const parentCats = categories.filter(c => c.parent_id == 0);
    const subCats = categories.filter(c => c.parent_id == formData.category_id);

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{initialData ? 'Edit Paket' : 'Paket Baru'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                        <input className="w-full border p-2 rounded" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kategori</label>
                            <select className="w-full border p-2 rounded" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                <option value="">Pilih...</option>
                                {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sub Kategori</label>
                            <select className="w-full border p-2 rounded" value={formData.sub_category_id} onChange={e => setFormData({...formData, sub_category_id: e.target.value})}>
                                <option value="">Opsional...</option>
                                {subCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Maskapai</label>
                            <select className="w-full border p-2 rounded" value={formData.airline_id} onChange={e => setFormData({...formData, airline_id: e.target.value})} required>
                                <option value="">Pilih...</option>
                                {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Link Itinerary</label>
                        <input type="text" className="w-full border p-2 rounded" value={formData.itinerary_file} onChange={e => setFormData({...formData, itinerary_file: e.target.value})} placeholder="URL File..." />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="font-bold block mb-2 text-sm">Hotel (Bisa pilih lebih dari 1)</label>
                        <div className="h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                            {hotels.map(h => (
                                <label key={h.id} className="flex items-center space-x-2 p-1 hover:bg-white cursor-pointer">
                                    <input type="checkbox" checked={formData.hotels.includes(parseInt(h.id))} onChange={() => toggleHotel(h.id)} />
                                    <span className="text-sm">{h.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-bold text-sm">Varian Harga Kamar (Dinamis)</label>
                            <button type="button" onClick={addVariant} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+ Tambah</button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {formData.pricing_variants.map((v, i) => (
                                <div key={i} className="flex space-x-2 items-center">
                                    <input placeholder="Tipe (Quad/Quint)" className="border p-1 rounded w-1/3 text-sm" list="roomTypes" value={v.type} onChange={e => handleVariantChange(i, 'type', e.target.value)} />
                                    <input type="number" placeholder="Harga" className="border p-1 rounded flex-1 text-sm" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} />
                                    <button type="button" onClick={() => removeVariant(i)} className="text-red-500 text-xs bg-red-50 p-1 rounded">Hapus</button>
                                </div>
                            ))}
                            <datalist id="roomTypes">
                                <option value="Quint" /><option value="Quad" /><option value="Triple" /><option value="Double" />
                            </datalist>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2 border-t pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded text-gray-700">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan Paket</button>
            </div>
        </form>
    );
};

export default PackageForm;