import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';

const MasterData = () => {
    const { getMasterData, createMasterData, deleteMasterData, getCategories, createCategory, deleteCategory, loading } = useApi();
    const [activeTab, setActiveTab] = useState('airline'); // 'airline', 'hotel', 'category'
    const [dataList, setDataList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({ name: '', parent_id: 0, details: '' });

    // Fetch Data saat Tab berubah
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            let res;
            if (activeTab === 'category') {
                res = await getCategories();
            } else {
                res = await getMasterData(activeTab);
            }
            setDataList(res || []);
        } catch (error) {
            console.error("Gagal ambil data", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'category') {
                await createCategory({ name: formData.name, parent_id: formData.parent_id });
            } else {
                await createMasterData({ 
                    name: formData.name, 
                    type: activeTab, 
                    details: formData.details // Bisa dikembangkan jadi JSON editor jika perlu
                });
            }
            setIsModalOpen(false);
            setFormData({ name: '', parent_id: 0, details: '' });
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin hapus data ini?')) return;
        try {
            if (activeTab === 'category') await deleteCategory(id);
            else await deleteMasterData(id);
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    // Filter Categories for Parent Dropdown
    const parentCategories = activeTab === 'category' ? dataList.filter(c => c.parent_id == 0) : [];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Data Master</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    + Tambah Data
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mb-6">
                {['airline', 'hotel', 'category'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 font-medium capitalize ${
                            activeTab === tab 
                            ? 'border-b-2 border-blue-600 text-blue-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab === 'airline' ? 'Maskapai' : tab === 'hotel' ? 'Hotel' : 'Kategori Paket'}
                    </button>
                ))}
            </div>

            {loading ? <Loading /> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                {activeTab === 'category' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Induk (Parent)</th>
                                )}
                                {activeTab !== 'category' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {dataList.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Belum ada data</td></tr>
                            ) : (
                                dataList.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        
                                        {activeTab === 'category' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.parent_id != 0 
                                                    ? (dataList.find(p => p.id == item.parent_id)?.name || '-') 
                                                    : <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Utama</span>
                                                }
                                            </td>
                                        )}

                                        {activeTab !== 'category' && (
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                                {typeof item.details === 'object' ? JSON.stringify(item.details) : item.details || '-'}
                                            </td>
                                        )}

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Tambah ${activeTab}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                        <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {activeTab === 'category' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kategori Induk (Opsional)</label>
                            <select
                                value={formData.parent_id}
                                onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="0">-- Tidak Ada (Kategori Utama) --</option>
                                {parentCategories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Pilih jika ini adalah Sub-Kategori (misal: Awal Tahun)</p>
                        </div>
                    )}

                    {activeTab !== 'category' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Detail Tambahan</label>
                            <textarea
                                value={formData.details}
                                onChange={(e) => setFormData({...formData, details: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                rows="3"
                                placeholder="Contoh: Lokasi hotel, Bintang 5, atau kode maskapai"
                            ></textarea>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="mr-2 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MasterData;