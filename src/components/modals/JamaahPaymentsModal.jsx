import React, { useState } from 'react';
// Menggunakan jalur traversal yang lebih eksplisit
import { Modal } from '../../components/common/Modal.jsx';
import { Button, Input } from '../../components/common/FormUI.jsx';
import { useApi } from '../../context/ApiContext.jsx';

const JamaahPaymentsModal = ({ jamaah, isOpen, onClose, onSuccess }) => {
    const { createPayment } = useApi();
    const [amount, setAmount] = useState('');
    const [proof, setProof] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!jamaah) return null;

    // Hitung sisa tagihan
    const sisaTagihan = jamaah.total_price - jamaah.amount_paid;

    const handleSubmit = async () => {
        // Validasi sederhana
        if (!amount || amount <= 0) {
            alert('Mohon masukkan nominal pembayaran yang valid.');
            return;
        }
        if (amount > sisaTagihan) {
            alert('Nominal pembayaran melebihi sisa tagihan!');
            return;
        }

        setLoading(true);
        try {
            // Panggil fungsi API createPayment
            await createPayment({
                jamaah_id: jamaah.id,
                package_id: jamaah.package_id,
                amount: amount,
                proof_file: proof
            });

            alert('Pembayaran berhasil disimpan!');
            if (onSuccess) onSuccess(); 
            onClose(); 
        } catch (error) {
            console.error("Payment Error:", error);
            alert('Gagal menyimpan pembayaran. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Pembayaran: ${jamaah.full_name}`}>
            <div className="space-y-6">
                {/* Informasi Tagihan */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Tagihan:</span>
                        <span className="font-semibold text-gray-900">Rp {parseInt(jamaah.total_price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Sudah Dibayar:</span>
                        <span className="font-semibold text-green-600">Rp {parseInt(jamaah.amount_paid).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-yellow-200 pt-1 mt-1 flex justify-between font-bold">
                        <span className="text-red-600">Sisa Tagihan:</span>
                        <span className="text-red-600">Rp {sisaTagihan.toLocaleString()}</span>
                    </div>
                </div>

                {/* Form Input */}
                <div className="space-y-4">
                    <Input 
                        label="Nominal Pembayaran (Rp)" 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="Contoh: 5000000"
                        min="0"
                        max={sisaTagihan}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Transfer (Opsional)</label>
                        <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={e => setProof(e.target.files[0])}
                        />
                        <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, atau PDF. Maks 2MB.</p>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !amount}>
                        {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default JamaahPaymentsModal;