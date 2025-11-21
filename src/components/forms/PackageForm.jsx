import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { Plus, Trash2 } from 'lucide-react';

const PackageForm = ({ initialData, onSuccess, onCancel }) => {
  const { api } = useApi();
  
  // State Dasar
  const [formData, setFormData] = useState(initialData || {
    name: '',
    category_id: '',
    airline_id: '',
    departure_date: '',
    duration_days: 9,
    quota: 45,
    itinerary_file: ''
  });

  // State Relasional
  const [hotels, setHotels] = useState(initialData?.hotels || []);
  const [prices, setPrices] = useState(initialData?.pricing_variants || [
    { type: 'Quad', price: 0 },
    { type: 'Triple', price: 0 },
    { type: 'Double', price: 0 }
  ]);

  // Master Data Options
  const [optHotels, setOptHotels] = useState([]);
  const [optAirlines, setOptAirlines] = useState([]);
  const [optCategories, setOptCategories] = useState([]);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [h, a, c] = await Promise.all([
          api.get('/hotels'),
          api.get('/airlines'),
          api.get('/categories')
        ]);
        setOptHotels(h.data || []);
        setOptAirlines(a.data || []);
        setOptCategories(c.data || []);
      } catch (e) {
        console.error("Failed to load master data", e);
      }
    };
    loadMasters();
  }, []);

  // Handlers
  const handleHotelChange = (index, field, value) => {
    const newHotels = [...hotels];
    newHotels[index] = { ...newHotels[index], [field]: value };
    
    // Auto-fill city jika hotel dipilih
    if (field === 'id') {
        const selectedHotel = optHotels.find(h => h.id == value);
        if(selectedHotel) newHotels[index].city = selectedHotel.city;
    }
    setHotels(newHotels);
  };

  const addHotel = () => setHotels([...hotels, { id: '', city: '', nights: 0 }]);
  const removeHotel = (index) => setHotels(hotels.filter((_, i) => i !== index));

  const handlePriceChange = (index, value) => {
    const newPrices = [...prices];
    newPrices[index].price = value;
    setPrices(newPrices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      hotels: hotels,
      pricing_variants: prices
    };

    try {
      if (initialData?.id) {
        await api.put(`/packages/${initialData.id}`, payload);
      } else {
        await api.post('/packages', payload);
      }
      onSuccess();
    } catch (err) {
      alert('Gagal menyimpan paket: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Dasar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-4 text-gray-700">Informasi Paket</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Paket</label>
            <input type="text" required className="w-full border rounded p-2"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select required className="w-full border rounded p-2"
              value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
              <option value="">Pilih Kategori</option>
              {optCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Maskapai</label>
            <select required className="w-full border rounded p-2"
              value={formData.airline_id} onChange={e => setFormData({...formData, airline_id: e.target.value})}>
              <option value="">Pilih Maskapai</option>
              {optAirlines.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Keberangkatan</label>
            <input type="date" required className="w-full border rounded p-2"
              value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-sm font-medium mb-1">Durasi (Hari)</label>
                <input type="number" required className="w-full border rounded p-2"
                value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Kuota</label>
                <input type="number" required className="w-full border rounded p-2"
                value={formData.quota} onChange={e => setFormData({...formData, quota: e.target.value})} />
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Configuration */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Akomodasi Hotel</h3>
            <button type="button" onClick={addHotel} className="text-sm text-blue-600 flex items-center gap-1"><Plus size={16}/> Tambah Hotel</button>
        </div>
        <div className="space-y-3">
            {hotels.map((hotel, idx) => (
                <div key={idx} className="flex gap-3 items-end bg-gray-50 p-3 rounded border">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Pilih Hotel</label>
                        <select className="w-full border rounded p-2 text-sm" 
                            value={hotel.id} onChange={e => handleHotelChange(idx, 'id', e.target.value)}>
                            <option value="">- Pilih -</option>
                            {optHotels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.city})</option>)}
                        </select>
                    </div>
                    <div className="w-24">
                        <label className="text-xs text-gray-500">Durasi (Malam)</label>
                        <input type="number" className="w-full border rounded p-2 text-sm"
                            value={hotel.nights} onChange={e => handleHotelChange(idx, 'nights', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeHotel(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                </div>
            ))}
            {hotels.length === 0 && <p className="text-sm text-gray-400 italic text-center">Belum ada hotel dipilih</p>}
        </div>
      </div>

      {/* Pricing Variants */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-4 text-gray-700">Varian Harga (Per Jamaah)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prices.map((price, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded border">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tipe {price.type}</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                        <input type="number" className="w-full border rounded pl-8 p-2"
                            value={price.price} onChange={e => handlePriceChange(idx, e.target.value)} />
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan Paket</button>
      </div>
    </form>
  );
};

export default PackageForm;