import React from 'react';
import { useForm } from 'react-hook-form';
import FormUI from '../common/FormUI';

const CATEGORIES = {
    in: ['Pembayaran Jamaah', 'Investasi', 'Komisi Masuk', 'Lainnya'],
    out: ['Operasional Kantor', 'Gaji Karyawan', 'Vendor Hotel', 'Vendor Tiket', 'Marketing', 'Lainnya']
};

export default function TransactionForm({ onSubmit, onCancel, isLoading }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            type: 'out',
            transaction_date: new Date().toISOString().split('T')[0],
            category: '',
            amount: '',
            description: ''
        }
    });

    const type = watch('type');

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Jenis Transaksi */}
            <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border rounded-lg p-3 text-center ${type === 'in' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'hover:bg-gray-50'}`}>
                    <input type="radio" value="in" {...register('type')} className="hidden" />
                    Pemasukan (Debit)
                </label>
                <label className={`cursor-pointer border rounded-lg p-3 text-center ${type === 'out' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'hover:bg-gray-50'}`}>
                    <input type="radio" value="out" {...register('type')} className="hidden" />
                    Pengeluaran (Kredit)
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormUI.Input
                    label="Tanggal Transaksi"
                    type="date"
                    {...register('transaction_date', { required: 'Tanggal wajib diisi' })}
                    error={errors.transaction_date}
                />
                
                <FormUI.Input
                    label="Nominal (Rp)"
                    type="number"
                    placeholder="Contoh: 5000000"
                    {...register('amount', { required: 'Nominal wajib diisi', min: 1 })}
                    error={errors.amount}
                />
            </div>

            <FormUI.Select
                label="Kategori"
                {...register('category', { required: 'Kategori wajib dipilih' })}
                options={CATEGORIES[type].map(c => ({ value: c, label: c }))}
                error={errors.category}
            />

            <FormUI.TextArea
                label="Keterangan / Deskripsi"
                placeholder="Jelaskan detail transaksi ini..."
                {...register('description', { required: 'Deskripsi wajib diisi' })}
                error={errors.description}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <FormUI.Button variant="secondary" onClick={onCancel} type="button">
                    Batal
                </FormUI.Button>
                <FormUI.Button type="submit" isLoading={isLoading} variant={type === 'in' ? 'primary' : 'danger'}>
                    Simpan Transaksi
                </FormUI.Button>
            </div>
        </form>
    );
}