import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import FormUI from '../components/common/FormUI';
import StatCard from '../components/common/StatCard';
import { useForm } from 'react-hook-form';

export default function Branches() {
    const { api } = useApi();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.get('/branches');
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
        if (confirm('Hapus data cabang ini?')) {
            await api.delete(`/branches/${id}`);
            fetchData();
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingItem) {
                await api.put(`/branches/${editingItem.id}`, data);
            } else {
                await api.post('/branches', data);
            }
            setIsModalOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            alert('Gagal menyimpan data cabang (Kode mungkin duplikat).');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kantor Cabang</h1>
                    <p className="text-sm text-gray-500">Kelola lokasi operasional perusahaan.</p>
                </div>
                <button 
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Tambah Cabang
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Cabang" value={items.length} color="blue" />
                <StatCard title="Cabang Aktif" value={items.filter(i => i.status === 'active').length} color="green" />
                <StatCard title="Kota Tercover" value={[...new Set(items.map(i => i.city))].length} color="purple" />
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode & Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kepala Cabang</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{item.code}</div>
                                    <div className="text-sm text-gray-600">{item.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{item.city}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{item.address}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{item.head_of_branch || '-'}</div>
                                    <div className="text-xs text-gray-500">{item.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.status === 'active' ? 'Buka' : 'Tutup'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Belum ada data cabang.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Edit Cabang" : "Buka Cabang Baru"}
            >
                <BranchForm 
                    initialData={editingItem} 
                    onSubmit={handleSave} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Modal>
        </div>
    );
}

function BranchForm({ initialData, onSubmit, onCancel }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData || { code: '', name: '', city: '', address: '', head_of_branch: '', phone: '', status: 'active' }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormUI.Input
                    label="Kode Cabang"
                    placeholder="Contoh: BANTEN-01"
                    {...register('code', { required: 'Kode wajib diisi' })}
                    error={errors.code}
                />
                <FormUI.Input
                    label="Nama Cabang"
                    placeholder="Cabang Serang Pusat"
                    {...register('name', { required: 'Nama wajib diisi' })}
                    error={errors.name}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormUI.Input
                    label="Kota"
                    {...register('city', { required: 'Kota wajib diisi' })}
                    error={errors.city}
                />
                <FormUI.Input
                    label="Kepala Cabang"
                    {...register('head_of_branch')}
                />
            </div>

            <FormUI.Input
                label="Nomor Telepon Kantor"
                {...register('phone')}
            />

            <FormUI.TextArea
                label="Alamat Lengkap"
                {...register('address')}
            />

            <FormUI.Select
                label="Status Operasional"
                {...register('status')}
                options={[
                    { value: 'active', label: 'Aktif / Buka' },
                    { value: 'inactive', label: 'Non-Aktif / Tutup Sementara' }
                ]}
            />

            <div className="flex justify-end space-x-2 pt-4">
                <FormUI.Button variant="secondary" type="button" onClick={onCancel}>Batal</FormUI.Button>
                <FormUI.Button type="submit">Simpan</FormUI.Button>
            </div>
        </form>
    );
}