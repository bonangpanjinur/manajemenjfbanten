// File Location: src/components/forms/FinanceForm.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { Input, Select, Button, Textarea } from '../common/FormUI';

const FinanceForm = ({ mode = 'operational', onSuccess, onCancel }) => {
    const { createCashTransaction, createPayment, getJamaahList } = useApi();
    const [loading, setLoading] = useState(false);
    const [jamaahList, setJamaahList] = useState([]);
    
    const [formData, setFormData] = useState({
        type: mode === 'operational' ? 'out' : 'in',
        category: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        proof_file: '',
        jamaah_id: '',
        payment_method: 'Transfer'
    });

    useEffect(() => {
        if (mode === 'payment') {
            getJamaahList({ payment_status: 'unpaid_partial' })
                .then(res => setJamaahList(Array.isArray(res) ? res : []))
                .catch(console.error);
        }
    }, [mode]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'operational') {
                await createCashTransaction(formData);
            } else {
                if (!formData.jamaah_id) throw new Error("Pilih Jamaah");
                await createPayment({
                    jamaah_id: formData.jamaah_id,
                    amount: formData.amount,
                    payment_date: formData.transaction_date,
                    payment_method: formData.payment_method,
                    description: formData.description,
                    proof_file: formData.proof_file
                });
            }
            onSuccess();
        } catch (err) { alert(err.message); } 
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'payment' && (
                <div className="bg-blue-50 p-3 rounded">
                    <label className="block text-sm font-bold mb-1">Pilih Jamaah</label>
                    <select name="jamaah_id" value={formData.jamaah_id} onChange={handleChange} className="w-full border p-2 rounded" required>
                        <option value="">-- Cari Jamaah --</option>
                        {jamaahList.map(j => (
                            <option key={j.id} value={j.id}>{j.full_name} (Sisa: {parseInt(j.remaining_payment).toLocaleString()})</option>
                        ))}
                    </select>
                </div>
            )}

            {mode === 'operational' && (
                <div className="flex gap-4">
                    <label><input type="radio" name="type" value="out" checked={formData.type==='out'} onChange={handleChange} /> Pengeluaran</label>
                    <label><input type="radio" name="type" value="in" checked={formData.type==='in'} onChange={handleChange} /> Pemasukan Lain</label>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <Input label="Tanggal" type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required />
                <Input label="Nominal" type="number" name="amount" value={formData.amount} onChange={handleChange} required />
            </div>

            {mode === 'operational' && <Input label="Kategori" name="category" value={formData.category} onChange={handleChange} required />}
            <Textarea label="Keterangan" name="description" value={formData.description} onChange={handleChange} />
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>
                <Button type="submit" disabled={loading}>Simpan</Button>
            </div>
        </form>
    );
};

export default FinanceForm;