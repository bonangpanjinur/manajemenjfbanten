import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import PackageForm from '../components/forms/PackageForm';

const Packages = () => {
    const { getPackages, deletePackage } = useApi();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [filterStatus, setFilterStatus] = useState('active');

    // Fetch Data
    const fetchPackages = async () => {
        setLoading(true);
        try {
            // Kirim filter status ke API
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

    // Handler Delete
    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus paket ini? Data yang dihapus tidak bisa dikembalikan.')) return;
        try {
            await deletePackage(id);
            fetchPackages();
        } catch (error) {
            alert('Gagal menghapus: ' + error.message);
        }
    };

    // Handler Modal
    const handleAdd = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pkg) => {
        setEditData(pkg);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchPackages();
    };

    // Helper untuk menampilkan list hotel dari ID
    // (Idealnya di-join di backend, tapi jika data master diload di context bisa di-lookup di sini)
    // Untuk simplifikasi, kita tampilkan jumlahnya atau nama jika tersedia di objek paket (jika backend sudah join)
    
    // Format Harga: Menampilkan range harga terendah - tertinggi
    const formatPriceRange = (variants) => {
        if (!variants || variants.length === 0) return 'Belum ada harga';
        // Jika variants berupa string JSON, parse dulu
        const vars = typeof variants === 'string' ? JSON.parse(variants) : variants;
        
        if (!Array.isArray(vars)) return 'Format Data Salah';
        
        const prices = vars.map(v => parseFloat(v.price));
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        
        if (min === max) return `Rp ${min.toLocaleString('id-ID')}`;
        return `Rp ${min.toLocaleString('id-ID')} - ${max.toLocaleString('id-ID')}`;
    };

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Paket</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola jadwal, harga, dan varian paket umroh.</p>
                </div>
                <div className="flex gap-3">
                    <select 
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition"
                    >
                        <span>+</span> Buat Paket
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
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Paket</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tgl Berangkat</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Harga Mulai</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {packages.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                                            Tidak ada paket yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    packages.map((pkg) => (
                                        <tr key={pkg.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">{pkg.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {/* Parsing JSON Hotel jika perlu, atau tampilkan count */}
                                                    {(() => {
                                                        try {
                                                            const h = typeof pkg.hotels === 'string' ? JSON.parse(pkg.hotels) : pkg.hotels;
                                                            return Array.isArray(h) && h.length > 0 ? `🏨 ${h.length} Hotel Terpilih` : 'Belum ada hotel';
                                                        } catch(e) { return '-'; }
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {new Date(pkg.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="text-xs text-blue-600">
                                                    ✈️ {pkg.airline_name || 'Maskapai -'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800">
                                                    {pkg.category_name || 'Umum'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                                {formatPriceRange(pkg.pricing_variants)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 
                                                      pkg.status === 'full' ? 'bg-red-100 text-red-800' : 
                                                      'bg-gray-100 text-gray-800'}`}>
                                                    {pkg.status === 'active' ? 'Open' : 
                                                     pkg.status === 'full' ? 'Penuh' : pkg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => handleEdit(pkg)} 
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(pkg.id)} 
                                                    className="text-red-600 hover:text-red-900 font-medium"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? 'Edit Paket' : 'Tambah Paket Baru'}>
                {isModalOpen && (
                    <PackageForm 
                        initialData={editData} 
                        onSuccess={handleSuccess} 
                        onCancel={() => setIsModalOpen(false)} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default Packages;