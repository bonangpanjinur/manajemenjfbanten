import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import Loading from '../common/Loading';

const PackageForm = ({ initialData, onSuccess, onCancel }) => {
    const { createPackage, updatePackage, getMasterData, getCategories } = useApi();
    const [loadingData, setLoadingData] = useState(true);
    
    // Master Data Options
    const [airlines, setAirlines] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        sub_category_id: '',
        departure_date: '',
        airline_id: '',
        status: 'active',
        itinerary_file: '', // URL text
        hotels: [], // Array of IDs
        pricing_variants: [
            { type: 'Quad', price: 0, currency: 'IDR' },
            { type: 'Triple', price: 0, currency: 'IDR' },
            { type: 'Double', price: 0, currency: 'IDR' }
        ] 
    });

    // Init Data
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const [resAirline, resHotel, resCat] = await Promise.all([
                    getMasterData('airline'),
                    getMasterData('hotel'),
                    getCategories()
                ]);
                setAirlines(resAirline || []);
                setHotels(resHotel || []);
                setCategories(resCat || []);
                
                if (initialData) {
                    // Parsing data for edit mode
                    setFormData({
                        ...initialData,
                        hotels: initialData.hotels || [],
                        pricing_variants: initialData.pricing_variants || []
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchMasters();
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Multi-Select Hotels
    const toggleHotel = (hotelId) => {
        const current = formData.hotels;
        const id = parseInt(hotelId);
        if (current.includes(id)) {
            setFormData(prev => ({ ...prev, hotels: current.filter(h => h !== id) }));
        } else {
            setFormData(prev => ({ ...prev, hotels: [...current, id] }));
        }
    };

    // Handle Pricing Variants
    const updateVariant = (index, field, value) => {
        const newVariants = [...formData.pricing_variants];
        newVariants[index][field] = value;
        setFormData(prev => ({ ...prev, pricing_variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            pricing_variants: [...prev.pricing_variants, { type: '', price: 0, currency: 'IDR' }]
        }));
    };

    const removeVariant = (index) => {
        const newVariants = formData.pricing_variants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, pricing_variants: newVariants }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (initialData?.id) {
                await updatePackage(initialData.id, formData);
            } else {
                await createPackage(formData);
            }
            onSuccess();
        } catch (err) {
            alert("Gagal menyimpan: " + err.message);
        }
    };

    // Derived Data
    const parentCats = categories.filter(c => c.parent_id == 0);
    const subCats = categories.filter(c => c.parent_id == formData.category_id);

    if (loadingData) return <Loading text="Memuat Data Master..." />;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">{initialData ? 'Edit Paket' : 'Buat Paket Baru'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informasi Dasar */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Informasi Dasar</h3>
                    
                    <div>
                        <label className="label">Nama Paket</label>
                        <input type="text" name="name" className="input-field w-full border p-2 rounded" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="label">Kategori</label>
                            <select name="category_id" className="input-field w-full border p-2 rounded" value={formData.category_id} onChange={handleChange} required>
                                <option value="">Pilih Kategori</option>
                                {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Sub Kategori</label>
                            <select name="sub_category_id" className="input-field w-full border p-2 rounded" value={formData.sub_category_id} onChange={handleChange}>
                                <option value="">Pilih Sub (Opsional)</option>
                                {subCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Tanggal Keberangkatan</label>
                        <input type="date" name="departure_date" className="input-field w-full border p-2 rounded" value={formData.departure_date} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="label">Maskapai</label>
                        <select name="airline_id" className="input-field w-full border p-2 rounded" value={formData.airline_id} onChange={handleChange} required>
                            <option value="">Pilih Maskapai</option>
                            {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="label">Status</label>
                        <select name="status" className="input-field w-full border p-2 rounded" value={formData.status} onChange={handleChange}>
                            <option value="active">Aktif (Buka Pendaftaran)</option>
                            <option value="full">Penuh</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Link Itinerary (URL PDF/File)</label>
                        <input type="url" name="itinerary_file" placeholder="https://..." className="input-field w-full border p-2 rounded" value={formData.itinerary_file} onChange={handleChange} />
                    </div>
                </div>

                {/* Konfigurasi Harga & Hotel */}
                <div className="space-y-4 border-l pl-6">
                    <h3 className="font-semibold text-gray-700">Hotel & Harga</h3>
                    
                    {/* Hotel Multi Select */}
                    <div>
                        <label className="label mb-1 block">Pilih Hotel (Bisa Lebih dari 1)</label>
                        <div className="max-h-32 overflow-y-auto border rounded p-2 grid grid-cols-1 gap-1">
                            {hotels.length === 0 && <p className="text-xs text-gray-500">Belum ada data hotel</p>}
                            {hotels.map(h => (
                                <label key={h.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.hotels.includes(parseInt(h.id))} 
                                        onChange={() => toggleHotel(h.id)}
                                        className="rounded text-blue-600"
                                    />
                                    <span>{h.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Pricing */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="label">Varian Harga (Kamar)</label>
                            <button type="button" onClick={addVariant} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">+ Tambah</button>
                        </div>
                        
                        <div className="space-y-2">
                            {formData.pricing_variants.map((variant, idx) => (
                                <div key={idx} className="flex space-x-2 items-center">
                                    <input 
                                        type="text" 
                                        placeholder="Tipe (Quad/Double)" 
                                        className="w-1/3 border p-1 text-sm rounded"
                                        value={variant.type}
                                        onChange={(e) => updateVariant(idx, 'type', e.target.value)}
                                        list="roomTypes"
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Harga" 
                                        className="w-1/3 border p-1 text-sm rounded"
                                        value={variant.price}
                                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                    />
                                    <select 
                                        className="w-20 border p-1 text-sm rounded"
                                        value={variant.currency}
                                        onChange={(e) => updateVariant(idx, 'currency', e.target.value)}
                                    >
                                        <option value="IDR">IDR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                    <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">×</button>
                                </div>
                            ))}
                        </div>
                        <datalist id="roomTypes">
                            <option value="Quad" />
                            <option value="Quint" />
                            <option value="Triple" />
                            <option value="Double" />
                        </datalist>
                        <p className="text-xs text-gray-500 mt-1">Pastikan nama tipe kamar unik (misal: Quad, Quint).</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end border-t pt-4 space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan Paket</button>
            </div>
        </form>
    );
};

export default PackageForm;