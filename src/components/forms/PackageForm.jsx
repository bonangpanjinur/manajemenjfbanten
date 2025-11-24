import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
// import toast from 'react-hot-toast'; // DIKOMENTARI KARENA LIBRARY TIDAK ADA
import FormUI from '../common/FormUI';
import { Save, X } from 'lucide-react';

const PackageForm = ({ initialData, onSubmit, onCancel }) => {
    const { loading } = useApi('packages');
    
    // Default structure for a package
    const defaultData = {
        name: '',
        category: 'Umrah',
        price_quad: '',
        price_triple: '',
        price_double: '',
        departure_date: '',
        program_days: 9,
        hotel_makkah: '',
        hotel_madinah: '',
        airline: '',
        quota: 45,
        status: 'Open',
        description: ''
    };

    const [formData, setFormData] = useState(defaultData);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...defaultData, ...initialData });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validasi sederhana
            if(!formData.name || !formData.price_quad) {
                alert("Nama Paket dan Harga Quad wajib diisi!");
                return;
            }

            await onSubmit(formData);
            // toast.success('Paket berhasil disimpan'); // Ganti dengan alert
            // alert('Paket berhasil disimpan'); // Opsional, biasanya parent yg handle close
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan paket: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormUI.Input
                    label="Nama Paket"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Umrah Akbar Syawal"
                    required
                />
                
                <FormUI.Select
                    label="Kategori"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={[
                        { value: 'Umrah', label: 'Umrah Reguler' },
                        { value: 'Umrah Plus', label: 'Umrah Plus Wisata' },
                        { value: 'Haji', label: 'Haji Khusus/Furoda' },
                        { value: 'Tour', label: 'Halal Tour' }
                    ]}
                />

                <FormUI.Input
                    label="Tanggal Keberangkatan"
                    name="departure_date"
                    type="date"
                    value={formData.departure_date}
                    onChange={handleChange}
                    required
                />

                <FormUI.Input
                    label="Durasi (Hari)"
                    name="program_days"
                    type="number"
                    value={formData.program_days}
                    onChange={handleChange}
                />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign size={16}/> Harga Paket
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormUI.Input
                        label="Quad (Sekamar Ber-4)"
                        name="price_quad"
                        type="number"
                        prefix="Rp"
                        value={formData.price_quad}
                        onChange={handleChange}
                        required
                    />
                    <FormUI.Input
                        label="Triple (Sekamar Ber-3)"
                        name="price_triple"
                        type="number"
                        prefix="Rp"
                        value={formData.price_triple}
                        onChange={handleChange}
                    />
                    <FormUI.Input
                        label="Double (Sekamar Ber-2)"
                        name="price_double"
                        type="number"
                        prefix="Rp"
                        value={formData.price_double}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormUI.Input
                    label="Hotel Makkah"
                    name="hotel_makkah"
                    value={formData.hotel_makkah}
                    onChange={handleChange}
                    placeholder="Nama Hotel"
                />
                 <FormUI.Input
                    label="Hotel Madinah"
                    name="hotel_madinah"
                    value={formData.hotel_madinah}
                    onChange={handleChange}
                    placeholder="Nama Hotel"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormUI.Input
                    label="Maskapai"
                    name="airline"
                    value={formData.airline}
                    onChange={handleChange}
                    placeholder="Garuda/Saudia..."
                />
                <FormUI.Input
                    label="Kuota Seat"
                    name="quota"
                    type="number"
                    value={formData.quota}
                    onChange={handleChange}
                />
                <FormUI.Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={[
                        { value: 'Open', label: 'Open (Dibuka)' },
                        { value: 'Full', label: 'Full Booked' },
                        { value: 'Closed', label: 'Closed (Selesai)' },
                        { value: 'Draft', label: 'Draft' }
                    ]}
                />
            </div>

            <FormUI.TextArea
                label="Deskripsi / Fasilitas"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <X size={18} /> Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-70"
                >
                    {loading ? 'Menyimpan...' : <><Save size={18} /> Simpan Paket</>}
                </button>
            </div>
        </form>
    );
};

// Helper component for icon needed inside
const DollarSign = ({size}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

export default PackageForm;