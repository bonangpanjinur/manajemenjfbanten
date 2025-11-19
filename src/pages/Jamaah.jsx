import React, { useState, useMemo } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { Modal } from '../components/common/Modal.jsx';
import JamaahForm from '../components/forms/JamaahForm.jsx';
import { formatCurrency } from '../utils/helpers.js';
import { Plus, Edit, Trash2, Search, User } from 'lucide-react';

// PERBAIKAN: Import dari '../components/common/FormUI.jsx' bukan '../common/FormUI.jsx'
import { Button, Input, Select } from '../components/common/FormUI.jsx';
// -----------------------------------------------------------

import JamaahPaymentsModal from '../components/modals/JamaahPaymentsModal.jsx'; 
// Pastikan path modal pembayaran juga benar jika Anda menggunakannya
// Jika file ini belum ada, bisa di-comment dulu atau dibuatkan.

const Jamaah = () => {
    const { data, loading, deleteItem, refreshData } = useApi();
    const jamaahList = data.jamaah || [];
    const packages = data.packages || [];

    const [modal, setModal] = useState({ open: false, item: null });
    const [paymentModal, setPaymentModal] = useState({ open: false, item: null });
    const [filter, setFilter] = useState('');

    const filtered = useMemo(() => jamaahList.filter(j => j.full_name.toLowerCase().includes(filter.toLowerCase())), [jamaahList, filter]);

    const handleDelete = async (id) => {
        if (confirm('Hapus data jemaah ini?')) {
            await deleteItem('jamaah', id);
            refreshData('jamaah');
        }
    };

    const getPackageName = (id) => packages.find(p => p.id == id)?.name || 'Paket Tidak Ditemukan';

    if (loading && jamaahList.length === 0) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Data Jemaah</h1>
                <Button onClick={() => setModal({ open: true, item: null })} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2"/> Tambah Jemaah
                </Button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <div className="p-4 border-b relative">
                    <Search className="absolute top-7 left-7 w-4 h-4 text-gray-400"/>
                    <input className="pl-10 p-2 border rounded w-full md:w-64" placeholder="Cari nama jemaah..." value={filter} onChange={e=>setFilter(e.target.value)} />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Paket</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status Bayar</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filtered.map(item => {
                                const paid = parseFloat(item.amount_paid || 0);
                                const total = parseFloat(item.total_price || 0);
                                const isLunas = paid >= total && total > 0;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600 font-bold w-10 h-10 flex items-center justify-center">
                                                    {item.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{item.full_name}</div>
                                                    <div className="text-xs text-gray-500">{item.passport_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{getPackageName(item.package_id)}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <span className={`font-bold ${isLunas ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {isLunas ? 'Lunas' : 'Belum Lunas'}
                                                </span>
                                                <div className="text-xs text-gray-500">
                                                    {formatCurrency(paid)} / {formatCurrency(total)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button variant="icon" onClick={() => setModal({ open: true, item: item })}><Edit className="w-4 h-4 text-blue-600"/></Button>
                                            <Button variant="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal 
                title={modal.item ? 'Edit Jemaah' : 'Pendaftaran Jemaah'} 
                isOpen={modal.open} 
                onClose={() => setModal({ open: false, item: null })}
                size="lg"
            >
                <JamaahForm 
                    initialData={modal.item} 
                    packages={packages}
                    onCancel={() => setModal({ open: false, item: null })}
                    // Kita pass refreshData agar setelah simpan, list terupdate
                    onSuccess={() => {
                        setModal({ open: false, item: null });
                        refreshData('jamaah');
                    }}
                />
            </Modal>
        </div>
    );
};

export default Jamaah;