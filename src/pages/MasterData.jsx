import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import FormUI from '../components/common/FormUI';
import Modal from '../components/common/Modal';
import { useForm } from 'react-hook-form';

export default function MasterData() {
    const { api } = useApi();
    const [activeTab, setActiveTab] = useState('categories'); // categories, hotels, airlines
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Master Data</h1>
            
            <div className="flex border-b border-gray-200">
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'categories' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('categories')}
                >
                    Kategori Paket
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'hotels' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('hotels')}
                >
                    Hotel
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'airlines' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('airlines')}
                >
                    Maskapai
                </button>
            </div>

            <div className="mt-6">
                {activeTab === 'categories' && <CategoriesManager api={api} />}
                {activeTab === 'hotels' && <div className="p-4 bg-gray-50 rounded border text-center text-gray-500">Modul Hotel (Placeholder)</div>}
                {activeTab === 'airlines' && <div className="p-4 bg-gray-50 rounded border text-center text-gray-500">Modul Maskapai (Placeholder)</div>}
            </div>
        </div>
    );
}

// Sub-Component: Categories Manager
function CategoriesManager({ api }) {
    // State untuk toggle Main vs Sub
    const [viewMode, setViewMode] = useState('main'); // 'main' or 'sub'
    const [items, setItems] = useState([]);
    const [mainCategories, setMainCategories] = useState([]); // Cache parent categories for dropdown
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Fetch data based on view mode
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch main categories (Parent ID = 0)
            const mains = await api.get('/categories?parent_id=0');
            setMainCategories(mains);

            if (viewMode === 'main') {
                setItems(mains);
            } else {
                // Fetch ALL categories to filter subs on frontend or backend
                // Disini kita asumsikan backend support filter semua, tapi idealnya fetch khusus sub
                // Karena API kita support ?parent_id=... kita harusnya fetch semua yang parent_id != 0
                // Tapi untuk simpel, kita fetch ALL lalu filter di JS
                const all = await api.get('/categories?all=true');
                const subs = all.filter(c => c.parent_id && c.parent_id != 0);
                setItems(subs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewMode]);

    const handleDelete = async (id) => {
        if (confirm('Hapus kategori ini?')) {
            await api.delete(`/categories/${id}`);
            fetchData();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="space-x-2">
                    <button 
                        onClick={() => setViewMode('main')}
                        className={`px-3 py-1 rounded text-sm font-medium ${viewMode === 'main' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        Kategori Utama
                    </button>
                    <button 
                        onClick={() => setViewMode('sub')}
                        className={`px-3 py-1 rounded text-sm font-medium ${viewMode === 'sub' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        Sub Kategori
                    </button>
                </div>
                <button 
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
                >
                    + Tambah {viewMode === 'main' ? 'Kategori Utama' : 'Sub Kategori'}
                </button>
            </div>

            {loading ? <Loading /> : (
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
                                {viewMode === 'sub' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Induk (Main)</th>}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map(item => {
                                // Find parent name if sub
                                const parent = mainCategories.find(p => p.id == item.parent_id);
                                return (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                        {viewMode === 'sub' && (
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {parent ? parent.name : '-'}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.slug}</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-indigo-600">Edit</button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600">Hapus</button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {items.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Kategori' : (viewMode === 'main' ? 'Tambah Kategori Utama' : 'Tambah Sub Kategori')}
            >
                <CategoryForm 
                    api={api}
                    initialData={editingItem}
                    isSub={viewMode === 'sub'}
                    mainCategories={mainCategories}
                    onSuccess={() => { setIsModalOpen(false); fetchData(); }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}

function CategoryForm({ api, initialData, isSub, mainCategories, onSuccess, onCancel }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData || { name: '', description: '', parent_id: isSub ? '' : 0 }
    });
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            // Ensure parent_id is 0 for main, or selected value for sub
            if (!isSub) data.parent_id = 0;
            
            if (initialData) {
                await api.put(`/categories/${initialData.id}`, data);
            } else {
                await api.post('/categories', data);
            }
            onSuccess();
        } catch (err) {
            alert('Error saving category');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSub && (
                <FormUI.Select
                    label="Kategori Utama (Induk)"
                    {...register('parent_id', { required: 'Harap pilih kategori induk' })}
                    options={mainCategories.map(c => ({ value: c.id, label: c.name }))}
                    error={errors.parent_id}
                />
            )}

            <FormUI.Input
                label="Nama Kategori"
                {...register('name', { required: 'Nama wajib diisi' })}
                error={errors.name}
            />

            <FormUI.TextArea
                label="Deskripsi"
                {...register('description')}
            />

            <div className="flex justify-end space-x-2 mt-4">
                <FormUI.Button variant="secondary" type="button" onClick={onCancel}>Batal</FormUI.Button>
                <FormUI.Button type="submit" isLoading={submitting}>Simpan</FormUI.Button>
            </div>
        </form>
    );
}