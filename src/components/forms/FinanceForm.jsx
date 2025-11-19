import React, { useState } from 'react';
import { Button, Input, Select, Textarea } from '../common/FormUI.jsx';

const FinanceForm = ({ initialData, accounts = [], onSubmit, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        transaction_date: initialData?.transaction_date || new Date().toISOString().split('T')[0],
        description: initialData?.description || '',
        amount: initialData?.amount || '',
        type: initialData?.type || 'expense',
        account_id: initialData?.account_id || (accounts.length > 0 ? accounts[0].id : ''),
        category: initialData?.category || 'Operasional',
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Tanggal Transaksi" 
                    type="date" 
                    name="transaction_date" 
                    value={formData.transaction_date} 
                    onChange={handleChange} 
                    required 
                />
                <Select 
                    label="Jenis Transaksi" 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange}
                >
                    <option value="income">Pemasukan (Income)</option>
                    <option value="expense">Pengeluaran (Expense)</option>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Nominal (IDR)" 
                    type="number" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleChange} 
                    required 
                />
                <Select 
                    label="Akun / Dompet" 
                    name="account_id" 
                    value={formData.account_id} 
                    onChange={handleChange}
                    required
                >
                    <option value="">Pilih Akun</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                            {acc.account_name} ({acc.bank_name})
                        </option>
                    ))}
                </Select>
            </div>

            <Input 
                label="Kategori" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                placeholder="Contoh: Transportasi, Akomodasi, DP Jamaah"
            />

            <Textarea 
                label="Keterangan / Deskripsi" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
            />

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </Button>
            </div>
        </form>
    );
};

export default FinanceForm;