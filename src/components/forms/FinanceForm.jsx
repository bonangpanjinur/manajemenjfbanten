import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import Loading from '../common/Loading';

const FinanceForm = ({ mode = 'operational', onSuccess, onCancel }) => {
    const { createCashTransaction, createPayment, getJamaahList } = useApi();
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    
    // State untuk List Jamaah (Searchable)
    const [jamaahOptions, setJamaahOptions] = useState([]);
    const [searchJamaah, setSearchJamaah] = useState('');

    const [formData, setFormData] = useState({
        type: mode === 'operational' ? 'out' : 'in', // Default operational = pengeluaran
        category: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        proof_file: '',
        // Khusus Payment
        jamaah_id: '',
        payment_method: 'Transfer'
    });

    useEffect(() => {
        if (mode === 'payment') {
            // Load data jamaah yang belum lunas (ideal)
            // Untuk simpel load semua dulu
            getJamaahList({ payment_status: 'unpaid_partial' }) // Perlu update API backend support ini
                .then(res => setJamaahOptions(res || []))
                .catch(console.error);
        }
    }, [mode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);
        try {
            if (mode === 'operational') {
                await createCashTransaction(formData);
            } else {
                await createPayment({
                    jamaah_id: formData.jamaah_id,
                    amount: formData.amount,
                    payment_date: formData.transaction_date,
                    payment_method: formData.payment_method,
                    proof_file: formData.proof_file,
                    notes: formData.description
                });
            }
            onSuccess();
        } catch (err) {
            alert("Gagal: " + err.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    // Filter jamaah dropdown
    const filteredJamaah = jamaahOptions.filter(j => 
        j.full_name.toLowerCase().includes(searchJamaah.toLowerCase()) ||
        (j.passport_number && j.passport_number.includes(searchJamaah))
    );

    if (loadingSubmit) return <Loading text="Menyimpan Transaksi..." />;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">
                {mode === 'operational' ? 'Catat Kas Operasional' : 'Input Pembayaran Jamaah'}
            </h3>

            {/* MODE PEMBAYARAN JAMAAH: PILIH ORANG */}
            {mode === 'payment' && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4">
                    <label className="label">Cari Jamaah</label>
                    <input 
                        type="text" 
                        placeholder="Ketik Nama / No Paspor..." 
                        className="input-field w-full mb-2"
                        value={searchJamaah}
                        onChange={e => setSearchJamaah(e.target.value)}
                    />
                    <select 
                        className="input-field w-full font-bold text-blue-800"
                        value={formData.jamaah_id}
                        onChange={e => setFormData({...formData, jamaah_id: e.target.value})}
                        required
                        size={5} // Tampilkan sebagai list
                    >
                        {filteredJamaah.map(j => (
                            <option key={j.id} value={j.id} className="p-2 border-b hover:bg-blue-100">
                                {j.full_name} - {j.package_name} (Sisa Tagihan: {new Intl.NumberFormat('id-ID').format(j.remaining_payment)})
                            </option>
                        ))}
                    </select>
                    {formData.jamaah_id && <p className="text-xs text-green-600 mt-1">Jamaah Terpilih ✅</p>}
                </div>
            )}

            {/* MODE OPERASIONAL: PILIH TIPE (MASUK/KELUAR) */}
            {mode === 'operational' && (
                <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border p-3 rounded text-center ${formData.type === 'in' ? 'bg-green-100 border-green-500 text-green-800 font-bold' : 'bg-gray-50'}`}>
                        <input type="radio" name="type" value="in" checked={formData.type === 'in'} onChange={() => setFormData({...formData, type: 'in'})} className="hidden" />
                        ⬇ Kas Masuk
                    </label>
                    <label className={`cursor-pointer border p-3 rounded text-center ${formData.type === 'out' ? 'bg-red-100 border-red-500 text-red-800 font-bold' : 'bg-gray-50'}`}>
                        <input type="radio" name="type" value="out" checked={formData.type === 'out'} onChange={() => setFormData({...formData, type: 'out'})} className="hidden" />
                        ⬆ Kas Keluar
                    </label>
                </div>
            )}

            {/* FORM UMUM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Tanggal Transaksi</label>
                    <input type="date" className="input-field w-full" value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})} required />
                </div>
                <div>
                    <label className="label">Nominal (Rp)</label>
                    <input type="number" className="input-field w-full text-right font-mono font-bold" placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                </div>
            </div>

            {mode === 'operational' ? (
                <div>
                    <label className="label">Kategori</label>
                    <input type="text" placeholder="Contoh: Listrik, Konsumsi, Hotel..." className="input-field w-full" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                </div>
            ) : (
                <div>
                    <label className="label">Metode Pembayaran</label>
                    <select className="input-field w-full" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                        <option value="Transfer">Transfer Bank</option>
                        <option value="Tunai">Tunai / Cash</option>
                        <option value="EDC">Kartu Debit/Kredit</option>
                    </select>
                </div>
            )}

            <div>
                <label className="label">Keterangan / Catatan</label>
                <textarea className="input-field w-full" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
            </div>

            <div>
                <label className="label">Link Bukti (URL Gambar)</label>
                <input type="text" placeholder="https://..." className="input-field w-full" value={formData.proof_file} onChange={e => setFormData({...formData, proof_file: e.target.value})} />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t mt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700">Simpan</button>
            </div>
        </form>
    );
};

export default FinanceForm;