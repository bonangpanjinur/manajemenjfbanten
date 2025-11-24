import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormUI from '../common/FormUI';

export default function FinanceForm({ initialData, onSubmit, onCancel }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (initialData) {
            const formatted = { 
                ...initialData,
                transaction_date: initialData.transaction_date ? initialData.transaction_date.split('T')[0] : ''
            };
            reset(formatted);
        } else {
            reset({
                type: 'out',
                transaction_date: new Date().toISOString().split('T')[0],
                category: 'Operasional'
            });
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormUI.Select
                    label="Jenis Transaksi"
                    {...register('type', { required: true })}
                    options={[
                        { value: 'in', label: 'Pemasukan (In)' },
                        { value: 'out', label: 'Pengeluaran (Out)' }
                    ]}
                />
                <FormUI.Input
                    label="Tanggal"
                    type="date"
                    {...register('transaction_date', { required: true })}
                />
            </div>
            
            <FormUI.Input
                label="Kategori"
                placeholder="Contoh: Listrik, Gaji, Perlengkapan"
                {...register('category', { required: 'Kategori wajib diisi' })}
                error={errors.category}
            />

            <FormUI.Input
                label="Jumlah (Rp)"
                type="number"
                {...register('amount', { required: 'Nominal wajib diisi', min: 1 })}
                error={errors.amount}
            />

            {/* Perbaikan: Menggunakan TextArea dengan huruf kapital A yang benar */}
            <FormUI.TextArea
                label="Keterangan / Deskripsi"
                rows={3}
                {...register('description', { required: 'Deskripsi wajib diisi' })}
                error={errors.description}
            />

            <div className="flex justify-end space-x-2 pt-2">
                <FormUI.Button variant="secondary" onClick={onCancel} type="button">Batal</FormUI.Button>
                <FormUI.Button type="submit">Simpan Transaksi</FormUI.Button>
            </div>
        </form>
    );
}