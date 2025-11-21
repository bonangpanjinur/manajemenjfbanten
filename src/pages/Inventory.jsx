import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import FormUI from '../components/common/FormUI';
import { useForm } from 'react-hook-form';

export default function Inventory() {
    const { api } = useApi();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.get('/inventory');
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (confirm('Hapus barang ini dari sistem?')) {
            await api.delete(`/inventory/${id}`);
            fetchData();
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingItem) {
                await api.put(`/inventory/${editingItem.id}`, data);
            } else {
                await api.post('/inventory', data);
            }
            setIsModalOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            alert('Gagal menyimpan data');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Logistik & Perlengkapan</h1>
                    <p className="text-sm text-gray-500">Atur stok koper, kain ihram, batik, dan buku panduan.</p>
                </div>
                <button 
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Tambah Barang
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ringkasan Stok */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-800">Total Item Fisik</h3>
                    <p className="text-2xl font-bold">{items.reduce((acc, curr) => acc + parseInt(curr.stock_quantity), 0)} <span className="text-sm font-normal">unit</span></p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-orange-800">Perlu Restock</h3>
                    <p className="text-2xl font-bold">{items.filter(i => parseInt(i.stock_quantity) < 10).length} <span className="text-sm font-normal">jenis barang</span></p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Tersedia</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500">{item.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 capitalize">{item.type}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`text-sm font-bold ${item.stock_quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                        {item.stock_quantity} {item.unit}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada data logistik.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Edit Stok Barang" : "Tambah Barang Baru"}
            >
                <InventoryForm 
                    initialData={editingItem} 
                    onSubmit={handleSave} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Modal>
        </div>
    );
}

function InventoryForm({ initialData, onSubmit, onCancel }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData || { name: '', stock_quantity: 0, unit: 'pcs', type: 'equipment', description: '' }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormUI.Input
                label="Nama Barang"
                placeholder="Contoh: Koper Fiber 24 Inch"
                {...register('name', { required: 'Nama barang wajib diisi' })}
                error={errors.name}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormUI.Input
                    label="Stok Awal"
                    type="number"
                    {...register('stock_quantity', { required: true, min: 0 })}
                />
                <FormUI.Input
                    label="Satuan"
                    placeholder="pcs, set, lusin"
                    {...register('unit')}
                />
            </div>

            <FormUI.Select
                label="Tipe Barang"
                {...register('type')}
                options={[
                    { value: 'equipment', label: 'Perlengkapan (Koper/Ihram)' },
                    { value: 'souvenir', label: 'Souvenir / Hadiah' },
                    { value: 'document', label: 'Dokumen / ID Card' }
                ]}
            />

            <FormUI.TextArea
                label="Deskripsi / Catatan"
                {...register('description')}
            />

            <div className="flex justify-end space-x-2 pt-4">
                <FormUI.Button variant="secondary" type="button" onClick={onCancel}>Batal</FormUI.Button>
                <FormUI.Button type="submit">Simpan</FormUI.Button>
            </div>
        </form>
    );
}