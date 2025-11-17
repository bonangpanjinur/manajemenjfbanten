import React, { useState, useEffect } from 'react';
// PERBAIKAN: Menambahkan ekstensi .jsx
import { useApi } from '../../context/ApiContext.jsx';
// PERBAIKAN: Impor bernama (named import) dan ekstensi .jsx
import { ErrorMessage } from '../common/ErrorMessage.jsx';
import { LoadingSpinner as Loading } from '../common/Loading.jsx';
import { Input, Textarea, Button, Select, Checkbox } from '../common/FormUI.jsx';
// --- AKHIR PERBAIKAN ---
import { Plus, Trash2 } from 'lucide-react';
// PERBAIKAN: Menambahkan ekstensi .js
import { formatCurrency, parseCurrency } from '../../utils/helpers.js';
// --- AKHIR PERBAIKAN ---

// --- PERBAIKAN: Seluruh logika dibungkus dalam komponen fungsi ---
const PackageForm = ({ data, onClose }) => {
    const { createOrUpdate, loading: apiLoading, error: apiError } = useApi();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const initialData = data || {
        name: '',
        description: '',
        price: '0',
        duration_days: '9',
        start_date: '',
        end_date: '',
        departure_city: 'JKT',
        total_seats: 50,
        available_seats: 50,
        status: 'available',
        includes_flights: true,
        includes_hotels: true,
        includes_visa: true,
        itinerary: JSON.stringify([{ day: '1', title: '', details: '' }]),
        includes: [],
    };

    const [formData, setFormData] = useState({
        name: initialData.name,
        description: initialData.description,
        duration_days: initialData.duration_days,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        departure_city: initialData.departure_city,
        total_seats: initialData.total_seats,
        available_seats: initialData.available_seats,
        status: initialData.status,
        includes_flights: initialData.includes_flights,
        includes_hotels: initialData.includes_hotels,
        includes_visa: initialData.includes_visa,
    });
    const [price, setPrice] = useState(formatCurrency(initialData.price));
    const [itinerary, setItinerary] = useState(initialData.itinerary ? JSON.parse(initialData.itinerary) : [{ day: '1', title: '', details: '' }]);
    const [includes, setIncludes] = useState(initialData.includes ? initialData.includes.join('\n') : '');

    useEffect(() => {
        if (apiError) {
            setError(apiError);
        }
    }, [apiError]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePriceChange = (e) => {
        setPrice(formatCurrency(e.target.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const finalData = {
            ...formData,
            price: parseCurrency(price), // PERBAIKAN: Fungsi ini sekarang diimpor dengan benar
            itinerary: JSON.stringify(itinerary),
            includes: includes.split('\n').filter(line => line.trim() !== ''),
            // Pastikan tipe data angka benar
            duration_days: parseInt(formData.duration_days, 10) || 0,
            total_seats: parseInt(formData.total_seats, 10) || 0,
            available_seats: parseInt(formData.available_seats, 10) || 0,
        };

        // Jika ini adalah update, sertakan ID
        if (data && data.id) {
            finalData.id = data.id;
        }

        try {
            await createOrUpdate('package', finalData);
            setLoading(false);
            onClose(); // Tutup modal setelah sukses
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Gagal menyimpan paket.');
        }
    };

    const handleIncludesChange = (e) => {
        setIncludes(e.target.value);
    };

    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...itinerary];
        newItinerary[index][field] = value;
        setItinerary(newItinerary);
    };

    const addItineraryDay = () => {
        setItinerary([...itinerary, { day: `${itinerary.length + 1}`, title: '', details: '' }]);
    };

    const removeItineraryDay = (index) => {
        const newItinerary = itinerary.filter((_, i) => i !== index);
        setItinerary(newItinerary);
    };

    // Ini adalah baris 157 di file asli Anda, sekarang di dalam fungsi
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} />}

            <Input
                label="Nama Paket"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <Textarea
                label="Deskripsi"
                name="description"
                value={formData.description}
                onChange={handleChange}
            />
            <Input
                label="Harga (IDR)"
                name="price"
                value={price}
                onChange={handlePriceChange}
                required
            />
            
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Durasi (Hari)"
                    name="duration_days"
                    type="number"
                    value={formData.duration_days}
                    onChange={handleChange}
                    required
                />
                <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="available">Tersedia</option>
                    <option value="full">Penuh</option>
                    <option value="completed">Selesai</option>
                    <option value="draft">Draft</option>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Tanggal Mulai"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Tanggal Selesai"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Kota Keberangkatan"
                    name="departure_city"
                    value={formData.departure_city}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Total Kursi"
                    name="total_seats"
                    type="number"
                    value={formData.total_seats}
                    onChange={handleChange}
                    required
                />
            </div>

             <Input
                label="Kursi Tersedia"
                name="available_seats"
                type="number"
                value={formData.available_seats}
                onChange={handleChange}
                required
            />

            <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-gray-700">Fasilitas Termasuk</legend>
                <Checkbox label="Termasuk Penerbangan" name="includes_flights" checked={formData.includes_flights} onChange={handleChange} />
                <Checkbox label="Termasuk Hotel" name="includes_hotels" checked={formData.includes_hotels} onChange={handleChange} />
                <Checkbox label="Termasuk Visa" name="includes_visa" checked={formData.includes_visa} onChange={handleChange} />
            </fieldset>

            <Textarea
                label="Daftar Fasilitas (satu per baris)"
                name="includes"
                value={includes}
                onChange={handleIncludesChange}
                rows={5}
                placeholder="Hotel Bintang 5&#10;Makan 3x Sehari&#10;Bus AC"
            />

            <div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">Itinerary</h4>
                {itinerary.map((item, index) => (
                    <div key={index} className="space-y-2 border p-4 rounded-lg mb-4 bg-gray-50 relative">
                        <Input
                            label={`Hari ke-${item.day}`}
                            name={`itinerary-title-${index}`}
                            value={item.title}
                            onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                            placeholder="Judul/Lokasi (cth: Madinah)"
                        />
                        <Textarea
                            label="Detail"
                            name={`itinerary-details-${index}`}
                            value={item.details}
                            onChange={(e) => handleItineraryChange(index, 'details', e.target.value)}
                            rows={3}
                            placeholder="Detail kegiatan..."
                        />
                        {itinerary.length > 1 && (
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => removeItineraryDay(index)}
                                className="absolute top-2 right-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={addItineraryDay}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Hari
                </Button>
            </div>


            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={onClose} disabled={loading || apiLoading}>
                    Batal
                </Button>
                <Button type="submit" disabled={loading || apiLoading}>
                    {(loading || apiLoading) ? <Loading /> : (data ? 'Update Paket' : 'Simpan Paket')}
                </Button>
            </div>
        </form>
    );
};
// --- AKHIR PERBAIKAN ---

export default PackageForm;