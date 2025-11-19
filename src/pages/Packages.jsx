import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import PackageForm from '../components/forms/PackageForm';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';

const Packages = () => {
    const { getPackages, deletePackage, loading } = useApi();
    const [packages, setPackages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await getPackages();
            setPackages(res || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus paket ini? Data jamaah terkait mungkin akan error.')) return;
        try {
            await deletePackage(id);
            fetchPackages();
        } catch (err) {
            alert("Gagal hapus: " + err.message);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPackage(null);
    };

    // Helper: Format Harga Terendah
    const getLowestPrice = (variants) => {
        if (!variants || variants.length === 0) return '-';
        const prices = variants.map(v => parseFloat(v.price));
        const min = Math.min(...prices);
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(min);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Paket Umroh</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow"
                >
                    + Buat Paket Baru
                </button>
            </div>

            {loading ? <Loading /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.length === 0 && <p className="col-span-3 text-center text-gray-500 py-10">Belum ada paket dibuat.</p>}
                    
                    {packages.map(pkg => (
                        <div key={pkg.id} className="bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-100 overflow-hidden">
                            <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold uppercase text-blue-600 tracking-wide">{pkg.category_name || 'Umroh'}</span>
                                    <h3 className="text-lg font-bold text-gray-800 mt-1">{pkg.name}</h3>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {pkg.status === 'active' ? 'Open' : pkg.status}
                                </span>
                            </div>
                            
                            <div className="p-4 space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-6 text-center mr-2">✈️</span>
                                    <span>{pkg.departure_date} (Maskapai ID: {pkg.airline_id})</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-6 text-center mr-2">🏨</span>
                                    <span>{Array.isArray(pkg.hotels) ? pkg.hotels.length : 0} Hotel Terpilih</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-6 text-center mr-2">💰</span>
                                    <span>Mulai {getLowestPrice(pkg.pricing_variants)}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 flex justify-between border-t">
                                <button onClick={() => handleEdit(pkg)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit Detail</button>
                                <button onClick={() => handleDelete(pkg.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Full Screen untuk Form yang Kompleks */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-4xl">
                        <PackageForm 
                            initialData={editingPackage} 
                            onSuccess={() => { closeModal(); fetchPackages(); }} 
                            onCancel={closeModal} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Packages;