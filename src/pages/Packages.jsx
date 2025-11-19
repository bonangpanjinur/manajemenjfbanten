import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { Button, Input, Textarea, Select } from '../components/common/FormUI';
// Anda mungkin perlu install 'react-select' untuk multi-select maskapai/hotel
// npm install react-select

const Packages = () => {
    const [isEditing, setIsEditing] = useState(false);
    // ... listing logic ...
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Paket</h2>
                <Button onClick={() => setIsEditing(true)}>Buat Paket Baru</Button>
            </div>
            {isEditing ? <PackageForm onCancel={() => setIsEditing(false)} /> : <PackageList />}
        </div>
    );
};

const PackageForm = ({ onCancel }) => {
    const { masterData } = useApi(); // Asumsi ada data maskapai & hotel di context
    const [form, setForm] = useState({
        name: '',
        duration_days: 9,
        total_seats: 45,
        pricing: [{ type: 'Quad', price: 0 }, { type: 'Triple', price: 0 }, { type: 'Double', price: 0 }],
        dates: [''],
        airlines: [], // Array ID
        hotels: [], // Array ID
    });

    const addDate = () => setForm({ ...form, dates: [...form.dates, ''] });
    const updateDate = (idx, val) => {
        const newDates = [...form.dates];
        newDates[idx] = val;
        setForm({ ...form, dates: newDates });
    };
    const updatePrice = (idx, val) => {
        const newPricing = [...form.pricing];
        newPricing[idx].price = val;
        setForm({ ...form, pricing: newPricing });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Form Paket Umroh</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nama Paket" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <Input label="Durasi (Hari)" type="number" value={form.duration_days} onChange={e => setForm({...form, duration_days: e.target.value})} />
                
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Varian Harga & Kamar</label>
                    <div className="grid grid-cols-3 gap-4">
                        {form.pricing.map((variant, idx) => (
                            <div key={idx} className="border p-3 rounded">
                                <label className="block text-xs font-bold mb-1">{variant.type}</label>
                                <Input type="number" value={variant.price} onChange={e => updatePrice(idx, e.target.value)} placeholder="Harga" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Keberangkatan</label>
                    {form.dates.map((date, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <Input type="date" value={date} onChange={e => updateDate(idx, e.target.value)} />
                        </div>
                    ))}
                    <Button variant="secondary" onClick={addDate} size="sm">+ Tambah Tanggal</Button>
                </div>

                <Input label="Total Seat" type="number" value={form.total_seats} onChange={e => setForm({...form, total_seats: e.target.value})} />
                
                {/* Implementasi Multi Select untuk Maskapai & Hotel disini */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Maskapai (Pilih Lebih dari satu)</label>
                    <select multiple className="w-full border rounded p-2 h-24" onChange={e => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setForm({...form, airlines: selected});
                    }}>
                        {masterData?.airlines?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                    <Button variant="secondary" onClick={onCancel}>Batal</Button>
                    <Button>Simpan Paket</Button>
                </div>
            </div>
        </div>
    );
};

const PackageList = () => (
    <div className="bg-white p-4 shadow rounded">
        <p>Tabel list paket dengan filter...</p>
        {/* Implementasi tabel similar to marketing */}
    </div>
);

export default Packages;