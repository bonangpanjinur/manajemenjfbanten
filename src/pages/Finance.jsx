// File: src/pages/Finance.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';

const Finance = () => {
    const { getCashflow, createCashflow, createPayment, getJamaah } = useApi();
    const [activeTab, setActiveTab] = useState('cashflow'); // cashflow, payment
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({ month: '', year: new Date().getFullYear() });

    // Form State
    const [formData, setFormData] = useState({});
    const [jamaahList, setJamaahList] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'cashflow') {
                const res = await getCashflow(filters);
                setData(res || []);
            } else {
                // Load history pembayaran jamaah atau cashflow kategori pembayaran
                const res = await getCashflow({ category: 'Pembayaran Jamaah', ...filters });
                setData(res || []);
            }
        } catch (error) {
            console.error("Fetch finance error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPayment(formData);
            alert('Pembayaran berhasil disimpan!');
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCashflowSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCashflow(formData);
            alert('Data kas berhasil disimpan!');
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    // Load jamaah saat modal pembayaran dibuka
    const openPaymentModal = async () => {
        setFormData({ jamaah_id: '', amount: 0, date: '', notes: '' });
        setModalOpen(true);
        try {
            const res = await getJamaah({ limit: 100 }); 
            setJamaahList(res || []);
        } catch (error) {
            console.error("Gagal load jamaah:", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Keuangan</h1>

            <div className="flex space-x-4 mb-6">
                <button 
                    onClick={() => setActiveTab('cashflow')} 
                    className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'cashflow' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    Arus Kas (Operasional)
                </button>
                <button 
                    onClick={() => setActiveTab('payment')} 
                    className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'payment' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    Pembayaran Jamaah
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <select 
                        className="border border-gray-300 p-2 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" 
                        value={filters.month} 
                        onChange={e => setFilters({...filters, month: e.target.value})}
                    >
                        <option value="">Semua Bulan</option>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => activeTab === 'cashflow' ? setModalOpen(true) : openPaymentModal()} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-sm font-medium transition flex items-center gap-2"
                >
                    <span>+</span> {activeTab === 'cashflow' ? 'Input Kas' : 'Input Pembayaran'}
                </button>
            </div>

            {loading ? <Loading /> : (
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Nominal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400">Belum ada data transaksi.</td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.transaction_date || item.payment_date).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {item.description || item.notes || `Pembayaran Jamaah #${item.jamaah_id}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.type === 'in' || activeTab === 'payment' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {activeTab === 'payment' ? 'Pemasukan' : (item.type === 'in' ? 'Kas Masuk' : 'Kas Keluar')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-800">
                                            {item.type === 'out' && activeTab === 'cashflow' ? '-' : '+'} Rp {parseInt(item.amount).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={activeTab === 'cashflow' ? 'Input Kas Operasional' : 'Input Pembayaran Jamaah'}>
                {activeTab === 'cashflow' ? (
                    <form onSubmit={handleCashflowSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Transaksi</label>
                            <select 
                                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                onChange={e => setFormData({...formData, type: e.target.value})} 
                                required
                            >
                                <option value="">-- Pilih Tipe --</option>
                                <option value="in">Pemasukan (Kas Masuk)</option>
                                <option value="out">Pengeluaran (Kas Keluar)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                            <input type="number" className="w-full border border-gray-300 p-2 rounded-lg" onChange={e => setFormData({...formData, amount: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                            <input type="date" className="w-full border border-gray-300 p-2 rounded-lg" onChange={e => setFormData({...formData, transaction_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                            <textarea className="w-full border border-gray-300 p-2 rounded-lg" rows="3" onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Contoh: Biaya listrik, Beli ATK, dll"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md">Simpan Data</button>
                    </form>
                ) : (
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Jamaah</label>
                            <select className="w-full border border-gray-300 p-2 rounded-lg" onChange={e => setFormData({...formData, jamaah_id: e.target.value})} required>
                                <option value="">-- Cari Jamaah --</option>
                                {jamaahList.map(j => <option key={j.id} value={j.id}>{j.full_name} - {j.package_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Pembayaran (Rp)</label>
                            <input type="number" className="w-full border border-gray-300 p-2 rounded-lg" onChange={e => setFormData({...formData, amount: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Bayar</label>
                            <input type="date" className="w-full border border-gray-300 p-2 rounded-lg" onChange={e => setFormData({...formData, payment_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                            <textarea className="w-full border border-gray-300 p-2 rounded-lg" rows="3" onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Contoh: Pelunasan tahap 1, DP, dll"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 shadow-md">Simpan Pembayaran</button>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Finance;