import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext'; // Pastikan path ini sesuai struktur folder
import { useForm } from 'react-hook-form';
import FormUI from '../common/FormUI'; // Perbaiki import ke common
import Loading from '../common/Loading';

const JamaahLedger = () => {
    const { api } = useApi();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selectedJamaah, setSelectedJamaah] = useState(null);
    const [ledgerData, setLedgerData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // State untuk Form Tambah Bayar
    const [showPayModal, setShowPayModal] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // 1. Cari Jemaah
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (searchTerm.length > 2) {
                try {
                    const res = await api.get(`/jamaah/search?q=${searchTerm}`);
                    setSearchResult(res || []);
                } catch (e) { console.error(e); }
            } else {
                setSearchResult([]);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // 2. Ambil Detail Buku Besar
    const fetchLedger = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`/finance/jamaah/${id}`);
            setLedgerData(res);
            setSelectedJamaah(res.jamaah);
            setSearchResult([]); // Clear search dropdown
            setSearchTerm(''); // Clear input
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // 3. Submit Pembayaran Baru
    const onPaymentSubmit = async (data) => {
        if(!ledgerData) return;
        try {
            await api.post('/finance/payment', {
                ...data,
                jamaah_id: ledgerData.jamaah.id,
                jamaah_name: ledgerData.jamaah.name // Untuk log cashflow
            });
            setShowPayModal(false);
            reset();
            fetchLedger(ledgerData.jamaah.id); // Refresh ledger
            alert('Pembayaran berhasil disimpan!');
        } catch (e) {
            console.error(e);
            alert('Gagal menyimpan pembayaran');
        }
    };

    // 4. Print Handler
    const handlePrint = (paymentId) => {
        const printUrl = `/wp-content/plugins/manajemenjfbanten/admin/print-receipt.php?id=${paymentId}`;
        window.open(printUrl, '_blank', 'width=900,height=600');
    };

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Cari Nama Jemaah / No Paspor untuk melihat tagihan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {searchResult.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border mt-1 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {searchResult.map(j => (
                            <li key={j.id} 
                                onClick={() => fetchLedger(j.id)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-bold text-gray-800">{j.full_name}</div>
                                    <div className="text-xs text-gray-500">{j.passport_number}</div>
                                </div>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Lihat Tagihan</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Ledger View */}
            {loading && <Loading text="Memuat Buku Besar..." />}
            
            {!loading && ledgerData && (
                <div className="animate-fade-in">
                    {/* Header Profile */}
                    <div className="flex justify-between items-start bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{ledgerData.jamaah.name}</h2>
                            <p className="text-gray-500">Paket: {ledgerData.jamaah.package || 'Belum pilih paket'}</p>
                        </div>
                        <div className="text-right">
                            <button 
                                onClick={() => setShowPayModal(true)}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 shadow transition flex items-center gap-2"
                            >
                                <span className="dashicons dashicons-plus-alt2"></span> Tambah Pembayaran
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-xs text-blue-600 uppercase font-bold mb-1">Total Tagihan</div>
                            <div className="text-xl font-bold text-blue-900">{formatRp(ledgerData.summary.total_price)}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <div className="text-xs text-green-600 uppercase font-bold mb-1">Sudah Dibayar</div>
                            <div className="text-xl font-bold text-green-900">{formatRp(ledgerData.summary.total_paid)}</div>
                            <div className="w-full bg-green-200 h-1.5 mt-2 rounded-full">
                                <div className="bg-green-600 h-1.5 rounded-full" style={{width: `${ledgerData.summary.progress}%`}}></div>
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <div className="text-xs text-red-600 uppercase font-bold mb-1">Sisa Tagihan</div>
                            <div className="text-xl font-bold text-red-900">{formatRp(ledgerData.summary.remaining)}</div>
                        </div>
                    </div>

                    {/* Transaction History Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 font-medium text-gray-700">
                            Riwayat Transaksi
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">Keterangan</th>
                                    <th className="px-6 py-3">Metode</th>
                                    <th className="px-6 py-3 text-right">Jumlah</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {ledgerData.history.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Belum ada data pembayaran.</td></tr>
                                )}
                                {ledgerData.history.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            {new Date(item.payment_date).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-gray-900">{item.description}</div>
                                            <div className="text-xs text-gray-400">ID: #{item.id}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs border capitalize">{item.payment_method}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-medium text-gray-800">
                                            {formatRp(item.amount)}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <button 
                                                onClick={() => handlePrint(item.id)}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                                            >
                                                🖨 Cetak Kwitansi
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && !ledgerData && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-3">💰</div>
                    <h3 className="text-gray-600 font-medium">Buku Besar Pembayaran Jemaah</h3>
                    <p className="text-gray-400 text-sm">Silakan cari nama jemaah di atas untuk melihat detail keuangan.</p>
                </div>
            )}

            {/* Modal Tambah Bayar */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Input Pembayaran Baru</h3>
                            <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        <form onSubmit={handleSubmit(onPaymentSubmit)} className="p-6 space-y-4">
                            <FormUI.Input
                                label="Tanggal Bayar"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                {...register('date', { required: true })}
                            />
                            <FormUI.Input
                                label="Nominal (Rp)"
                                type="number"
                                placeholder="Contoh: 5000000"
                                {...register('amount', { required: true, min: 1000 })}
                            />
                             <FormUI.Select
                                label="Metode Pembayaran"
                                {...register('method')}
                                options={[
                                    { value: 'transfer', label: 'Transfer Bank' },
                                    { value: 'cash', label: 'Tunai / Cash' },
                                    { value: 'qris', label: 'QRIS' }
                                ]}
                            />
                            <FormUI.TextArea
                                label="Keterangan (Untuk Kwitansi)"
                                placeholder="Contoh: Pembayaran DP Paket Umrah Reguler"
                                {...register('description', { required: true })}
                                rows={2}
                            />
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 py-2 border rounded text-gray-600 hover:bg-gray-50">Batal</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JamaahLedger;