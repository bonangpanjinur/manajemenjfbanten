import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useApi } from '../../context/ApiContext';
import Modal from '../../components/common/Modal'; // FIX: Hapus kurung kurawal {}
import FormUI from '../../components/common/FormUI';

export default function JamaahPaymentsModal({ isOpen, onClose, jamaah, onSuccess }) {
    const { api } = useApi();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form saat modal dibuka/ditutup
    React.useEffect(() => {
        if (isOpen) {
            reset({
                amount: '',
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'transfer',
                description: ''
            });
        }
    }, [isOpen, jamaah, reset]);

    const onSubmit = async (data) => {
        if (!jamaah) return;
        
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                jamaah_id: jamaah.id,
                booking_id: 0 // Optional jika belum ada booking
            };

            await api.post('/jamaah/payments', payload);
            alert('Pembayaran berhasil dicatat.');
            onSuccess(); // Refresh data di parent
            onClose();
        } catch (error) {
            console.error(error);
            alert('Gagal mencatat pembayaran: ' + (error.message || 'Error Server'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!jamaah) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Catat Pembayaran - ${jamaah.full_name}`}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4">
                    <p><strong>Status Saat Ini:</strong> {jamaah.payment_status || 'Belum Bayar'}</p>
                    <p><strong>Total Terbayar:</strong> Rp {parseInt(jamaah.amount_paid || 0).toLocaleString('id-ID')}</p>
                </div>

                <FormUI.Input
                    label="Jumlah Pembayaran (Rp)"
                    type="number"
                    {...register('amount', { 
                        required: 'Jumlah wajib diisi',
                        min: { value: 10000, message: 'Minimal Rp 10.000' }
                    })}
                    error={errors.amount}
                    placeholder="Contoh: 5000000"
                />

                <FormUI.Input
                    label="Tanggal Pembayaran"
                    type="date"
                    {...register('payment_date', { required: 'Tanggal wajib diisi' })}
                    error={errors.payment_date}
                />

                <FormUI.Select
                    label="Metode Pembayaran"
                    {...register('payment_method')}
                    options={[
                        { value: 'transfer', label: 'Transfer Bank' },
                        { value: 'cash', label: 'Tunai / Cash' },
                        { value: 'qris', label: 'QRIS' },
                        { value: 'va', label: 'Virtual Account' }
                    ]}
                />

                <FormUI.TextArea
                    label="Keterangan / Catatan"
                    {...register('description')}
                    placeholder="No. Ref Transfer / Berita Acara"
                    rows={2}
                />

                <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                    <FormUI.Button variant="secondary" onClick={onClose} type="button">
                        Batal
                    </FormUI.Button>
                    <FormUI.Button type="submit" isLoading={isSubmitting}>
                        Simpan Pembayaran
                    </FormUI.Button>
                </div>
            </form>
        </Modal>
    );
}