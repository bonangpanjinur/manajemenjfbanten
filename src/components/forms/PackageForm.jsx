// Lokasi: src/components/forms/PackageForm.jsx

import React, { useState, useEffect } from 'react';
// --- PERBAIKAN: Path import absolut dari src/ ---
import { useApi } from 'context/ApiContext';
import { Input, Textarea, Select as FormSelect } from 'components/common/FormUI';
import Loading from 'components/common/Loading';
import ErrorMessage from 'components/common/ErrorMessage';
// --- AKHIR PERBAIKAN ---
import ReactSelect from 'react-select'; 

const PackageForm = ({ data, onSuccess }) => {
    const api = useApi();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '',
        includes: '',
        excludes: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        price_details: [], 
    });
    const [selectedHotels, setSelectedHotels] = useState([]);
    const [selectedFlights, setSelectedFlights] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (data) {
            let priceDetailsArray = [];
            if (typeof data.price_details === 'string') {
                try {
                    priceDetailsArray = JSON.parse(data.price_details);
                    if (!Array.isArray(priceDetailsArray)) {
                        priceDetailsArray = Object.keys(JSON.parse(data.price_details)).map(key => ({
                            name: key,
                            price: JSON.parse(data.price_details)[key]
                        }));
                    }
                } catch (e) {
                    console.error("Gagal parse price_details JSON:", e);
                    priceDetailsArray = [];
                }
            } else if (Array.isArray(data.price_details)) {
                priceDetailsArray = data.price_details;
            } else if (data.price_details && typeof data.price_details === 'object') {
                 priceDetailsArray = Object.keys(data.price_details).map(key => ({
                    name: key,
                    price: data.price_details[key]
                }));
            }

            setFormData({
                name: data.name || '',
                description: data.description || '',
                duration: data.duration || '',
                includes: data.includes || '',
                excludes: data.excludes || '',
                start_date: data.start_date ? data.start_date.split('T')[0] : '',
                end_date: data.end_date ? data.end_date.split('T')[0] : '',
                status: data.status || 'draft',
                price_details: priceDetailsArray.length > 0 ? priceDetailsArray : [{ name: 'Quad', price: '' }],
            });

            if (data.hotel_bookings && api.data.hotels) {
                const hotelOptions = data.hotel_bookings.map(booking => {
                    const hotel = api.data.hotels.find(h => h.id === booking.hotel_id);
                    return hotel ? { value: hotel.id, label: hotel.name } : null;
                }).filter(Boolean); 
                setSelectedHotels(hotelOptions);
            }

            if (data.flight_bookings && api.data.flights) {
                const flightOptions = data.flight_bookings.map(booking => {
                    const flight = api.data.flights.find(f => f.id === booking.flight_id);
                    return flight ? { value: flight.id, label: `${flight.airline_name} (${flight.flight_number})` } : null;
                }).filter(Boolean);
                setSelectedFlights(flightOptions);
            }

        } else {
            setFormData({
                name: '',
                description: '',
                duration: '',
                includes: '',
                excludes: '',
                start_date: '',
                end_date: '',
                status: 'draft',
                price_details: [{ name: 'Quad', price: '' }],
            });
            setSelectedHotels([]);
            setSelectedFlights([]);
        }
    }, [data, api.data.hotels, api.data.flights]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePriceDetailChange = (index, field, value) => {
        const newPriceDetails = [...formData.price_details];
        newPriceDetails[index][field] = value;
        setFormData(prev => ({ ...prev, price_details: newPriceDetails }));
    };

    const addPriceDetail = () => {
        setFormData(prev => ({
            ...prev,
            price_details: [...prev.price_details, { name: '', price: '' }]
        }));
    };

    const removePriceDetail = (index) => {
        const newPriceDetails = formData.price_details.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, price_details: newPriceDetails }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                id: data ? data.id : null,
                price_details: JSON.stringify(formData.price_details),
                hotel_ids: selectedHotels.map(h => h.value),
                flight_ids: selectedFlights.map(f => f.value),
            };

            await api.createOrUpdate('package', payload);
            onSuccess(); 
        } catch (err) {
            setError(err.message || 'Gagal menyimpan paket.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hotelOptions = (api.data.hotels || []).map(hotel => ({
        value: hotel.id,
        label: `${hotel.name} (${hotel.city})`
    }));

    const flightOptions = (api.data.flights || []).map(flight => ({
        value: flight.id,
        label: `${flight.airline_name} (${flight.flight_number || 'N/A'}) - ${flight.departure_airport} ke ${flight.arrival_airport}`
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Nama Paket"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Durasi (misal: 12 Hari)"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                />
            </div>

            <Textarea
                label="Deskripsi"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Textarea
                    label="Fasilitas Termasuk (Includes)"
                    name="includes"
                    value={formData.includes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Satu fasilitas per baris..."
                />
                <Textarea
                    label="Fasilitas Tidak Termasuk (Excludes)"
                    name="excludes"
                    value={formData.excludes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Satu fasilitas per baris..."
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    label="Tanggal Mulai (Opsional)"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                />
                <Input
                    label="Tanggal Selesai (Opsional)"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                />
                <FormSelect
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                </FormSelect>
            </div>

            <fieldset className="border border-gray-300 p-4 rounded-lg">
                <legend className="text-md font-semibold px-2">Detail Harga (Tipe Kamar)</legend>
                {(formData.price_details || []).map((detail, index) => (
                    <div key={index} className="flex items-center space-x-4 mb-4">
                        <div className="flex-1">
                            <Input
                                label={`Tipe Kamar ${index + 1}`}
                                name="name"
                                placeholder="Contoh: Quad"
                                value={detail.name}
                                onChange={(e) => handlePriceDetailChange(index, 'name', e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                label={`Harga ${index + 1}`}
                                name="price"
                                type="number"
                                placeholder="Contoh: 30000000"
                                value={detail.price}
                                onChange={(e) => handlePriceDetailChange(index, 'price', e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removePriceDetail(index)}
                            className="mt-6 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            disabled={formData.price_details.length <= 1}
                        >
                            Hapus
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addPriceDetail}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    + Tambah Tipe Kamar
                </button>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Hotel (Bisa lebih dari satu)
                    </label>
                    <ReactSelect
                        isMulti
                        name="hotels"
                        options={hotelOptions}
                        value={selectedHotels}
                        onChange={setSelectedHotels}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        isLoading={api.loading}
                        placeholder="Pilih hotel..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Maskapai (Bisa lebih dari satu)
                    </label>
                    <ReactSelect
                        isMulti
                        name="flights"
                        options={flightOptions}
                        value={selectedFlights}
                        onChange={setSelectedFlights}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        isLoading={api.loading}
                        placeholder="Pilih maskapai..."
                    />
                </div>
            </div>


            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loading text="Menyimpan..." /> : (data ? 'Update Paket' : 'Simpan Paket')}
                </button>
            </div>
        </form>
    );
};

export default PackageForm;