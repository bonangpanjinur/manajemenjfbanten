import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';
import { ErrorMessage } from '../common/ErrorMessage.jsx';
import { LoadingSpinner as Loading } from '../common/Loading.jsx';
import { Input, Textarea, Button, Select, Checkbox } from '../common/FormUI.jsx';
import { Plus, Trash2, Calendar, MapPin, Plane, Hotel, FileText } from 'lucide-react';
import { formatCurrency, parseCurrency } from '../../utils/helpers.js';

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
        departure_city: 'Jakarta',
        total_seats: 45,
        available_seats: 45,
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
        includes_flights: !!initialData.includes_flights,
        includes_hotels: !!initialData.includes_hotels,
        includes_visa: !!initialData.includes_visa,
    });
    const [price, setPrice] = useState(formatCurrency(initialData.price));
    const [itinerary, setItinerary] = useState(initialData.itinerary ? JSON.parse(initialData.itinerary) : [{ day: '1', title: '', details: '' }]);
    const [includes, setIncludes] = useState(initialData.includes ? initialData.includes.join('\n') : '');

    useEffect(() => {
        if (apiError) setError(apiError);
    }, [apiError]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const finalData = {
            ...formData,
            price: parseCurrency(price),
            itinerary: JSON.stringify(itinerary),
            includes: includes.split('\n').filter(line => line.trim() !== ''),
            duration_days: parseInt(formData.duration_days, 10) || 0,
            total_seats: parseInt(formData.total_seats, 10) || 0,
            available_seats: parseInt(formData.available_seats, 10) || 0,
        };

        if (data && data.id) finalData.id = data.id;

        try {
            await createOrUpdate('package', finalData);
            setLoading(false);
            onClose();
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Gagal menyimpan paket.');
        }
    };

    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...itinerary];
        newItinerary[index][field] = value;
        setItinerary(newItinerary);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && <ErrorMessage message={error} />}

            {/* SECTION 1: INFORMASI UTAMA */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-bold text-gray-700 mb-4 flex items-center uppercase tracking-wider">
                    <FileText className="w-4 h-4 mr-2" /> Informasi Dasar
                </h4>
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Nama Paket"
                        name="name"
                        placeholder="Contoh: Paket Umroh Awal Ramadhan"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Harga (IDR)"
                            name="price"
                            value={price}
                            onChange={(e) => setPrice(formatCurrency(e.target.value))}
                            required
                            className="font-bold text-green-700"
                        />
                        <Select
                            label="Status Paket"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="available">Tersedia (Buka Pendaftaran)</option>
                            <option value="full">Penuh (Full Booked)</option>
                            <option value="completed">Selesai (Berangkat)</option>
                            <option value="draft">Draft (Disembunyikan)</option>
                        </Select>
                    </div>
                    <Textarea
                        label="Deskripsi Singkat"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                    />
                </div>
            </div>

            {/* SECTION 2: JADWAL & KUOTA */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-md font-bold text-blue-800 mb-4 flex items-center uppercase tracking-wider">
                    <Calendar className="w-4 h-4 mr-2" /> Jadwal & Kuota
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Tanggal Berangkat" name="start_date" type="date" value={formData.start_date} onChange={handleChange} required />
                    <Input label="Tanggal Pulang" name="end_date" type="date" value={formData.end_date} onChange={handleChange} required />
                    <Input label="Durasi (Hari)" name="duration_days" type="number" value={formData.duration_days} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Input label="Kota Keberangkatan" name="departure_city" value={formData.departure_city} onChange={handleChange} required icon={<MapPin />} />
                    <Input label="Total Kursi (Seat)" name="total_seats" type="number" value={formData.total_seats} onChange={handleChange} required />
                    <Input label="Sisa Kursi" name="available_seats" type="number" value={formData.available_seats} onChange={handleChange} required />
                </div>
            </div>

            {/* SECTION 3: FASILITAS */}
            <div className="border p-4 rounded-lg">
                <h4 className="text-md font-bold text-gray-700 mb-4 flex items-center uppercase tracking-wider">
                    <Hotel className="w-4 h-4 mr-2" /> Fasilitas & Layanan
                </h4>
                <div className="flex gap-6 mb-4 p-3 bg-gray-50 rounded-md">
                    <Checkbox label="Termasuk Penerbangan" name="includes_flights" checked={formData.includes_flights} onChange={handleChange} />
                    <Checkbox label="Termasuk Hotel" name="includes_hotels" checked={formData.includes_hotels} onChange={handleChange} />
                    <Checkbox label="Termasuk Visa" name="includes_visa" checked={formData.includes_visa} onChange={handleChange} />
                </div>
                <Textarea
                    label="Fasilitas Lainnya (Satu per baris)"
                    name="includes"
                    value={includes}
                    onChange={(e) => setIncludes(e.target.value)}
                    rows={4}
                    placeholder="• Makan 3x Sehari menu Indonesia&#10;• Bus AC Eksekutif&#10;• Muthawif Berpengalaman"
                />
            </div>

            {/* SECTION 4: ITINERARY */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-gray-700 flex items-center uppercase tracking-wider">
                        <Plane className="w-4 h-4 mr-2" /> Rencana Perjalanan (Itinerary)
                    </h4>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setItinerary([...itinerary, { day: `${itinerary.length + 1}`, title: '', details: '' }])}>
                        <Plus className="w-4 h-4 mr-1" /> Tambah Hari
                    </Button>
                </div>
                
                <div className="space-y-3">
                    {itinerary.map((item, index) => (
                        <div key={index} className="flex gap-3 items-start bg-white border p-3 rounded-md shadow-sm group hover:border-blue-300 transition-colors">
                            <div className="w-12 pt-2">
                                <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                                    {index + 1}
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                    label="Judul Kegiatan"
                                    value={item.title}
                                    onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                                    placeholder="Contoh: Tiba di Madinah"
                                    className="md:col-span-1"
                                />
                                <div className="md:col-span-2 relative">
                                     <Textarea
                                        label="Detail"
                                        value={item.details}
                                        onChange={(e) => handleItineraryChange(index, 'details', e.target.value)}
                                        rows={2}
                                        placeholder="Deskripsi kegiatan..."
                                    />
                                </div>
                            </div>
                            {itinerary.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setItinerary(itinerary.filter((_, i) => i !== index))}
                                    className="text-gray-400 hover:text-red-500 mt-8"
                                    title="Hapus Hari"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={onClose} disabled={loading || apiLoading}>
                    Batal
                </Button>
                <Button type="submit" disabled={loading || apiLoading} className="min-w-[120px]">
                    {(loading || apiLoading) ? <Loading /> : (data ? 'Update Paket' : 'Simpan Paket')}
                </Button>
            </div>
        </form>
    );
};

export default PackageForm;