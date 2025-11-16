import React, { useState, useEffect } from 'react';
// PERBAIKAN: Menambahkan ekstensi .js
import { formatDateForInput } from '../../utils/helpers.js';
// PERBAIKAN: Menambahkan ekstensi .jsx
import { ModalFooter } from '../common/Modal.jsx';

// Form Keuangan
const FinanceForm = ({ initialData, onSubmit, onCancel, accounts }) => {
    const [formData, setFormData] = useState({
        transaction_date: formatDateForInput(new Date()),
        description: '',
        transaction_type: 'expense',
        amount: '',
        account_id: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                transaction_date: formatDateForInput(initialData.transaction_date)
            }));
        } else {
            // Reset form
            setFormData({
                transaction_date: formatDateForInput(new Date()),
                description: '',
                transaction_type: 'expense',
                amount: '',
                account_id: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group">
                    <label>Tanggal</label>
                    <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Akun</label>
                    <select name="account_id" value={formData.account_id} onChange={handleChange} required>
                        <option value="">Pilih Akun Kas</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Jenis Transaksi</label>
                    <select name="transaction_type" value={formData.transaction_type} onChange={handleChange} required>
                        <option value="expense">Debit (Pengeluaran)</option>
                        <option value="income">Kredit (Pemasukan)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Jumlah (Rp)</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                </div>

                <div className="form-group full-width">
                    <label>Deskripsi</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} />
                </div>
            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

export default FinanceForm;