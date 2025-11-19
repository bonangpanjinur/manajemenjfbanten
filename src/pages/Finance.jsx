import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Button, Input, Select, Textarea } from '../components/common/FormUI';

const Finance = () => {
    const [activeTab, setActiveTab] = useState('general'); // general | jamaah

    return (
        <div className="space-y-6">
            <div className="flex border-b border-gray-200">
                <button
                    className={`py-2 px-4 ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('general')}
                >
                    Kas Umum
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'jamaah' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('jamaah')}
                >
                    Pembayaran Jemaah
                </button>
            </div>

            {activeTab === 'general' ? <GeneralTransaction /> : <JamaahPaymentTransaction />}
        </div>
    );
};

const GeneralTransaction = () => {
    const { createTransaction, financeData } = useApi();
    const [form, setForm] = useState({ type: 'expense', amount: '', description: '', date: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        createTransaction(form);
        // Reset form logic here
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow h-fit">
                <h3 className="text-lg font-bold mb-4">Input Transaksi Kas</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select label="Jenis" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                        <option value="income">Pemasukan (Kas Masuk)</option>
                        <option value="expense">Pengeluaran (Kas Keluar)</option>
                    </Select>
                    <Input type="date" label="Tanggal" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                    <Input type="number" label="Nominal (Rp)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                    <Textarea label="Keterangan" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <Button type="submit">Simpan Transaksi</Button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Riwayat Transaksi</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase">Ket</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {financeData?.map(item => (
                            <tr key={item.id}>
                                <td className="py-2">{item.transaction_date}</td>
                                <td className="py-2">{item.description}</td>
                                <td className="py-2">Rp {parseInt(item.amount).toLocaleString()}</td>
                                <td className="py-2">
                                    <span className={`px-2 py-1 text-xs rounded ${item.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const JamaahPaymentTransaction = () => {
    const { jamaahData, packagesData, createPayment } = useApi();
    const [selectedPackage, setSelectedPackage] = useState('');
    const [selectedJamaah, setSelectedJamaah] = useState('');
    const [amount, setAmount] = useState('');
    const [proof, setProof] = useState(null);

    // Filter jemaah based on package
    const filteredJamaah = jamaahData?.filter(j => j.package_id == selectedPackage) || [];
    const currentJamaah = filteredJamaah.find(j => j.id == selectedJamaah);

    const handlePayment = (e) => {
        e.preventDefault();
        if (!currentJamaah) return;
        
        createPayment({
            jamaah_id: selectedJamaah,
            amount: amount,
            package_id: selectedPackage,
            proof_file: proof
        });
        // Logic to print Kwitansi trigger here
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
            <h3 className="text-lg font-bold mb-4">Pembayaran Jemaah</h3>
            <form onSubmit={handlePayment} className="space-y-4">
                <Select label="Pilih Paket" value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)}>
                    <option value="">-- Pilih Paket --</option>
                    {packagesData?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>

                <Select label="Pilih Jemaah" value={selectedJamaah} onChange={e => setSelectedJamaah(e.target.value)} disabled={!selectedPackage}>
                    <option value="">-- Pilih Jemaah --</option>
                    {filteredJamaah.map(j => <option key={j.id} value={j.id}>{j.full_name}</option>)}
                </Select>

                {currentJamaah && (
                    <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                        <p>Total Paket: Rp {parseInt(currentJamaah.total_price).toLocaleString()}</p>
                        <p>Sudah Bayar: Rp {parseInt(currentJamaah.amount_paid).toLocaleString()}</p>
                        <p className="font-bold">Sisa Tagihan: Rp {(currentJamaah.total_price - currentJamaah.amount_paid).toLocaleString()}</p>
                    </div>
                )}

                <Input type="number" label="Nominal Pembayaran (Rp)" value={amount} onChange={e => setAmount(e.target.value)} required />
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Pembayaran</label>
                    <input type="file" onChange={e => setProof(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="secondary">Cetak Tagihan</Button>
                    <Button type="submit">Proses Pembayaran</Button>
                </div>
            </form>
        </div>
    );
};

export default Finance;