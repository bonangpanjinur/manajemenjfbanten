import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import JamaahForm from '../components/forms/JamaahForm';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';

const Jamaah = () => {
    const { getJamaahList, deleteJamaah, getPackages, loading } = useApi();
    const [jamaahList, setJamaahList] = useState([]);
    const [packages, setPackages] = useState([]);
    
    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        package_id: '',
        payment_status: '',
        month: ''
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Debounce search or simple effect for filters
        const timer = setTimeout(() => {
            fetchJamaah();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const pkgRes = await getPackages({ status: 'active' });
            setPackages(pkgRes || []);
            fetchJamaah();
        } catch (err) {
            console.error(err);
        }
    };

    const fetchJamaah = async () => {
        try {
            const res = await getJamaahList(filters);
            setJamaahList(res || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin hapus data jamaah ini?')) return;
        try {
            await deleteJamaah(id);
            fetchJamaah();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (data) => {
        setEditingData(data);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingData(null);
        fetchJamaah(); // Refresh list after edit/add
    };

    // Helper: Format Rupiah
    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Data Jamaah</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow"
                >
                    + Input Jamaah Baru
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input 
                    type="text" 
                    placeholder="Cari Nama / No Paspor..." 
                    className="border p-2 rounded w-full"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
                <select 
                    className="border p-2 rounded w-full"
                    value={filters.package_id}
                    onChange={(e) => setFilters({...filters, package_id: e.target.value})}
                >
                    <option value="">Semua Paket</option>
                    {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                    ))}
                </select>
                <select 
                    className="border p-2 rounded w-full"
                    value={filters.payment_status}
                    onChange={(e) => setFilters({...filters, payment_status: e.target.value})}
                >
                    <option value="">Status Pembayaran</option>
                    <option value="lunas">Lunas</option>
                    <option value="partial">Belum Lunas (Partial)</option>
                    <option value="unpaid">Belum Bayar</option>
                </select>
                <input 
                    type="month" 
                    className="border p-2 rounded w-full"
                    value={filters.month}
                    onChange={(e) => setFilters({...filters, month: e.target.value})}
                />
            </div>

            {/* Table */}
            {loading && jamaahList.length === 0 ? <Loading /> : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama / Umur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket / Keberangkatan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Dokumen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembayaran</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jamaahList.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Tidak ada data jamaah.</td></tr>
                            ) : (
                                jamaahList.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{row.full_name}</div>
                                            <div className="text-xs text-gray-500">{row.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {row.age} Tahun</div>
                                            <div className="text-xs text-blue-500 mt-1">{row.phone_number}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-semibold">{row.package_name}</div>
                                            <div className="text-xs text-gray-500">Kamar: {row.selected_room_type}</div>
                                            <div className="text-xs text-gray-500">PIC: {row.pic_name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-1">
                                                <span title="KTP" className={`w-3 h-3 rounded-full ${row.document_status?.ktp ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                <span title="KK" className={`w-3 h-3 rounded-full ${row.document_status?.kk ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                <span title="Paspor" className={`w-3 h-3 rounded-full ${row.document_status?.passport ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                <span title="Meningitis" className={`w-3 h-3 rounded-full ${row.document_status?.meningitis ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Kit: <span className={`capitalize font-bold ${row.kit_status === 'sent' ? 'text-green-600' : 'text-yellow-600'}`}>{row.kit_status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-xs inline-flex px-2 py-1 rounded-full font-bold ${
                                                row.payment_status === 'lunas' ? 'bg-green-100 text-green-800' : 
                                                row.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {row.payment_status === 'lunas' ? 'LUNAS' : row.payment_status === 'partial' ? 'CICILAN' : 'BELUM BAYAR'}
                                            </div>
                                            {row.remaining_payment > 0 && (
                                                <div className="text-xs text-red-500 mt-1">Sisa: {formatIDR(row.remaining_payment)}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                            <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form Full Screen */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-5xl max-h-full overflow-y-auto my-8">
                         <div className="p-6">
                            <JamaahForm 
                                initialData={editingData} 
                                onSuccess={handleCloseModal} 
                                onCancel={handleCloseModal} 
                            />
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jamaah;