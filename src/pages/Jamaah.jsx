import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { Button, Input } from '../components/common/FormUI.jsx';
import { Upload, Banknote, FileText } from 'lucide-react';
import JamaahPaymentsModal from '../components/modals/JamaahPaymentsModal.jsx';

const Jamaah = () => {
    const { jamaahData, fetchJamaah } = useApi();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedJamaahForPay, setSelectedJamaahForPay] = useState(null);

    useEffect(() => {
        fetchJamaah();
    }, []);

    const filteredJamaah = jamaahData?.filter(j => {
        const matchName = j.full_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || j.payment_status === statusFilter;
        return matchName && matchStatus;
    });

    const openPaymentModal = (jamaah) => {
        setSelectedJamaahForPay(jamaah);
        setPaymentModalOpen(true);
    };

    const handleUploadDoc = (id) => {
        alert("Fitur upload dokumen akan membuka modal upload.");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Data Jemaah</h2>
                <Button>+ Daftar Jemaah Baru</Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow flex gap-4 flex-wrap">
                <Input 
                    placeholder="Cari Nama / KTP..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    className="w-full md:w-64"
                />
                <select 
                    className="border rounded p-2 text-gray-700"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="all">Semua Status Pembayaran</option>
                    <option value="paid">Lunas</option>
                    <option value="partial">Belum Lunas (Cicil)</option>
                    <option value="unpaid">Belum Bayar</option>
                </select>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tagihan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sisa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredJamaah?.map(j => {
                            const sisa = j.total_price - j.amount_paid;
                            return (
                                <tr key={j.id}>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {j.full_name}
                                        <div className="text-xs text-gray-500">{j.passport_number || 'No Passport'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">Paket ID: {j.package_id}</td>
                                    <td className="px-6 py-4 text-sm">Rp {parseInt(j.total_price).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                                        Rp {sisa.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${j.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {j.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium flex gap-2">
                                        {j.payment_status !== 'paid' && (
                                            <button 
                                                onClick={() => openPaymentModal(j)}
                                                className="text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded flex items-center gap-1"
                                                title="Bayar"
                                            >
                                                <Banknote size={16} /> Bayar
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleUploadDoc(j.id)}
                                            className="text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded flex items-center gap-1"
                                            title="Upload Dokumen"
                                        >
                                            <Upload size={16} />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900 px-2 py-1">
                                            <FileText size={16} /> Detail
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isPaymentModalOpen && (
                <JamaahPaymentsModal 
                    jamaah={selectedJamaahForPay} 
                    isOpen={isPaymentModalOpen} 
                    onClose={() => setPaymentModalOpen(false)} 
                    onSuccess={() => {
                        fetchJamaah();
                        setPaymentModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Jamaah;