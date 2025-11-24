import React, { useState, useEffect } from 'react';
import FormUI from '../common/FormUI';
import ImageUploader from '../common/ImageUploader';
import { useApi } from '../../context/ApiContext';
import toast from 'react-hot-toast';

const PackageForm = ({ initialData, onClose, onSuccess }) => {
  const { post, put } = useApi();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 9,
    airline: '',
    description: '',
    hotel_makkah: '',
    hotel_madinah: '',
    facilities: [], 
    images: [] 
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        duration: initialData.duration || 9,
        airline: initialData.airline || '',
        description: initialData.description || '',
        hotel_makkah: initialData.hotels?.makkah || initialData.hotel_makkah || '',
        hotel_madinah: initialData.hotels?.madinah || initialData.hotel_madinah || '',
        facilities: Array.isArray(initialData.facilities) ? initialData.facilities : [],
        images: Array.isArray(initialData.images) ? initialData.images : []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFacility = (facility) => {
    setFormData(prev => {
      const exists = prev.facilities.includes(facility);
      if (exists) {
        return { ...prev, facilities: prev.facilities.filter(f => f !== facility) };
      }
      return { ...prev, facilities: [...prev.facilities, facility] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = initialData ? `/packages/${initialData.id}` : '/packages';
      const method = initialData ? put : post;
      
      const res = await method(url, formData);
      
      if (res.success) {
        toast.success(initialData ? "Paket diperbarui!" : "Paket berhasil dibuat!");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error("Gagal menyimpan: " + (res.message || 'Error'));
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const FACILITY_OPTIONS = [
    "Tiket Pesawat PP", "Visa Umrah", "Visa Tambahan", 
    "Hotel Bintang 5", "Hotel Bintang 4", "Hotel Bintang 3",
    "Makan 3x Sehari", "Makan 2x Sehari",
    "Bus AC Eksekutif", "Kereta Cepat Haramain",
    "Mutawif Berpengalaman", "Air Zamzam 5L", 
    "Manasik Umrah", "Perlengkapan (Koper/Ihram)",
    "Handling Bandara", "Asuransi Perjalanan"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Info Dasar */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Informasi Dasar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormUI.Input
            label="Nama Paket"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Cth: Umrah Ramadhan 2025"
            required
          />
          <FormUI.Input
            label="Harga (IDR)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <FormUI.Input
            label="Durasi (Hari)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
          />
           <FormUI.Input
            label="Maskapai"
            name="airline"
            value={formData.airline}
            onChange={handleChange}
            placeholder="Cth: Saudia Airlines"
          />
        </div>
      </div>

      {/* 2. Galeri Foto */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">Galeri Foto</h3>
        <p className="text-sm text-gray-500 mb-4">Gambar pertama akan menjadi cover paket.</p>
        <ImageUploader 
          images={formData.images} 
          onChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))} 
          maxImages={8}
        />
      </div>

      {/* 3. Hotel */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Akomodasi Hotel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormUI.Input
            label="Hotel Makkah"
            name="hotel_makkah"
            value={formData.hotel_makkah}
            onChange={handleChange}
            placeholder="Cth: Zamzam Tower"
          />
          <FormUI.Input
            label="Hotel Madinah"
            name="hotel_madinah"
            value={formData.hotel_madinah}
            onChange={handleChange}
            placeholder="Cth: Rawda Royal Inn"
          />
        </div>
      </div>

      {/* 4. Fasilitas */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Fasilitas Termasuk</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FACILITY_OPTIONS.map((item) => (
            <label key={item} className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-white border border-transparent hover:border-gray-200 transition">
              <input
                type="checkbox"
                checked={formData.facilities.includes(item)}
                onChange={() => toggleFacility(item)}
                className="mt-1 rounded text-green-600 w-4 h-4"
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 5. Deskripsi */}
      <FormUI.TextArea
        label="Deskripsi Lengkap"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={5}
        placeholder="Jelaskan detail keunggulan paket ini..."
      />

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Paket'}
        </button>
      </div>
    </form>
  );
};

export default PackageForm;