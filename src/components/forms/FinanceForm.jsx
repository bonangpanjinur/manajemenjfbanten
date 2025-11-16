import React, { useState, useEffect } from 'react';
import { formatDateForInput } from '../../utils/helpers.js'; // .js ditambahkan
import { ModalFooter } from '../common/Modal.jsx'; // .jsx ditambahkan
import { Input, Select, FormGroup, FormLabel } from '../common/FormUI.jsx'; // .jsx ditambahkan

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                    <FormLabel htmlFor="transaction_date">Tanggal</FormLabel>
                    <Input type="date" name="transaction_date" id="transaction_date" value={formData.transaction_date} onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="account_id">Akun</FormLabel>
                    <Select name="account_id" id="account_id" value={formData.account_id} onChange={handleChange} required>
                        <option value="">Pilih Akun Kas</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </Select>
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="transaction_type">Jenis Transaksi</FormLabel>
                    <Select name="transaction_type" id="transaction_type" value={formData.transaction_type} onChange={handleChange} required>
                        <option value="expense">Debit (Pengeluaran)</option>
                        <option value="income">Kredit (Pemasukan)</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="amount">Jumlah (Rp)</FormLabel>
                    <Input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required />
                </FormGroup>

                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="description">Deskripsi</FormLabel>
                    <Input type="text" name="description" id="description" value={formData.description} onChange={handleChange} />
                </FormGroup>
            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

export default FinanceForm;