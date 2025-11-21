import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import PackageForm from '../components/forms/PackageForm';
import { Edit, Trash2, Plus, Plane, Building } from 'lucide-react';

const Packages = () => {
    const { getPackages, deletePackage } = useApi();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [filterStatus, setFilterStatus] = useState('active');

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const data = await getPackages({ status: filterStatus !== 'all' ? filterStatus : '' });
            setPackages(data || []);
        } catch (error) {
            console.error("Error fetching packages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [filterStatus]);

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin hapus paket ini? Data yang dihapus tidak bisa dikembalikan.')) return;
        try {
            await deletePackage(id);
            fetchPackages();
        } catch (error) {
            alert('Gagal menghapus: ' + error.message);
        }
    };

    const handleAdd = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pkg) => {
        setEditData(pkg);
        setIsModalOpen(true);
    };

    // Helper: Format Range Harga
    const formatPriceRange = (variants) => {
        if (!variants || variants.length === 0) return 'Belum ada harga';
        const vars = typeof variants === 'string' ? JSON.parse(variants) : variants;
        if (!Array.isArray(vars)) return '-';
        
        const prices = vars.map(v => parseFloat(v.price));
        if (prices.length === 0) return '-';

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        
        if (min === max) return `Rp ${min.toLocaleString('id-ID')}`;
        return `Rp ${min.toLocaleString('id-ID')} - ${max.toLocaleString('id-ID')}`;
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Paket</h1>
                    <p className="text-gray-500 text-sm mt-1">Atur jadwal keberangkatan dan harga paket.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select 
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="active">Paket Aktif</option>
                        <option value="full">Full Booked</option>
                        <option value="completed">Selesai</option>
                        <option value="all">Semua Status</option>
                    </select>
                    <button 
                        onClick={handleAdd} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition transform active:scale-95"
                    >
                        <Plus size={18}/> <span>Buat Paket</span>
                    </button>
                </div>
            </div>

            {/* Table Section */}
            {loading ? (
                <Loading text="Memuat data paket..." />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left">Nama Paket</th>
                                    <th className="px-6 py-3 text-left">Keberangkatan</th>
                                    <th className="px-6 py-3 text-left">Kategori</th>
                                    <th className="px-6 py-3 text-left">Harga Mulai</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {packages.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                                            Tidak ada paket yang ditemukan untuk filter ini.
                                        </td>
                                    </tr>
                                ) : (
                                    packages.map((pkg) => (
                                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-base">{pkg.name}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Building size={12}/>
                                                    {(() => {
                                                        try {
                                                            const h = typeof pkg.hotels === 'string' ? JSON.parse(pkg.hotels) : pkg.hotels;
                                                            return Array.isArray(h) && h.length > 0 ? `${h.length} Hotel` : 'Tanpa Hotel';
                                                        } catch(e) { return '-'; }
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {new Date(pkg.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                                    <Plane size={12}/> {pkg.airline_name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                    {pkg.category_name || 'Umum'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                                                {formatPriceRange(pkg.pricing_variants)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full border 
                                                    ${pkg.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                      pkg.status === 'full' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                      'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {pkg.status === 'active' ? 'Open' : 
                                                     pkg.status === 'full' ? 'Penuh' : pkg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEdit(pkg)} 
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Edit Paket"
                                                    >
                                                        <Edit size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(pkg.id)} 
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Hapus Paket"
                                                    >
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? 'Edit Paket' : 'Buat Paket Baru'}>
                {isModalOpen && (
                    <PackageForm 
                        initialData={editData} 
                        onSuccess={() => { setIsModalOpen(false); fetchPackages(); }} 
                        onCancel={() => setIsModalOpen(false)} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default Packages;