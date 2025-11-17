// Lokasi: src/components/modals/JamaahPaymentsModal.jsx

import React, { useState, useEffect } from 'react';
// --- PERBAIKAN: Path import relatif ---
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import { Input, Select, Textarea } from '../common/FormUI';
// --- AKHIR PERBAIKAN ---

const JamaahPaymentsModal = ({ jamaah, packageDetails, onClose }) => {
    const api = useApi();
    const { currentUser, hasRole } = useAuth();
    const [payments, setPayments] = useState([]);
    const [newPayment, setNewPayment] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        description: '',
        payment_method: 'transfer',
        status: 'pending',
        proof_of_payment_url: '',
    });
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const totalPaid = payments.reduce((acc, p) => acc + (p.status === 'verified' ? parseFloat(p.amount) : 0), 0);
    const totalPending = payments.reduce((acc, p) => acc + (p.status === 'pending' ? parseFloat(p.amount) : 0), 0);
    
    // Asumsi packageDetails.price adalah harga yang relevan untuk jemaah ini
    let priceDetails = [];
    if (packageDetails && packageDetails.price_details) {
         try {
            priceDetails = JSON.parse(packageDetails.price_details);
            if (!Array.isArray(priceDetails)) {
                 priceDetails = Object.keys(priceDetails).map(key => ({
                    name: key,
                    price: priceDetails[key]
                }));
            }
        } catch(e) {
            priceDetails = [];
        }
    }
    
    // TODO: Tentukan harga spesifik jemaah (misal: dari kamar yg dipilih)
    const mockPrice = priceDetails.length > 0 ? (priceDetails[0].price || 30000000) : 30000000;
    const remainingBalance = mockPrice - totalPaid;

    useEffect(() => {
        if (jamaah) {
            // Filter pembayaran untuk jemaah ini saja
            setPayments(api.data['jamaah-payments']?.filter(p => p.jamaah_id === jamaah.id) || []);
        }
    }, [api.data['jamaah-payments'], jamaah]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPayment(prev => ({ ...prev, [name]: value }));
    };

    const saveJamaahPayment = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        let paymentData = { ...newPayment, jamaah_id: jamaah.id };

        try {
            let proof_url = paymentData.proof_of_payment_url || '';

            if (file) {
                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('jamaah_id', jamaah.id);
                uploadData.append('upload_context', 'payment_proof');

                const uploadResult = await api.uploadFile(uploadData);

                if (uploadResult && uploadResult.url) {
                    proof_url = uploadResult.url;
                } else {
                    throw new Error(uploadResult.message || 'Gagal mengupload bukti pembayaran.');
                }
            }

            paymentData.proof_of_payment_url = proof_url;

            await api.createOrUpdate('jamaah-payments', { ...paymentData, id: paymentData.id || null });

            setNewPayment({
                amount: '',
                payment_date: new Date().toISOString().split('T')[0],
                description: '',
                payment_method: 'transfer',
                status: 'pending',
                proof_of_payment_url: '',
            });
            setFile(null);
            if (document.getElementById('payment_proof_file')) {
                document.getElementById('payment_proof_file').value = '';
            }
            api.refreshData('jamaah-payments');
        } catch (err) {
            console.error("Gagal menyimpan pembayaran:", err);
            setError(err.message || "Gagal menyimpan pembayaran.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (payment) => {
        setNewPayment({
            ...payment,
            payment_date: payment.payment_date.split('T')[0], // Format tanggal
        });
    };

    const deletePayment = async (paymentId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: 'Apakah Anda yakin ingin menghapus pembayaran ini? Tindakan ini tidak dapat dibatalkan.',
            onConfirm: async () => {
                try {
                    await api.deleteItem('jamaah-payments', paymentId);
                    api.refreshData('jamaah-payments');
                    setConfirmModal({ ...confirmModal, isOpen: false });
                } catch (err) {
                    console.error("Gagal menghapus:", err);
                    setError("Gagal menghapus pembayaran.");
                    setConfirmModal({ ...confirmModal, isOpen: false });
                }
            },
        });
    };

    const verifyPayment = (paymentId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Verifikasi',
            message: 'Apakah Anda yakin ingin memverifikasi pembayaran ini?',
            onConfirm: async () => {
                try {
                    await api.updatePaymentStatus(paymentId, 'verified');
                    api.refreshData('jamaah-payments');
                    setConfirmModal({ ...confirmModal, isOpen: false });
                } catch (err) {
                    console.error("Gagal verifikasi:", err);
                    setError("Gagal memverifikasi.");
                    setConfirmModal({ ...confirmModal, isOpen: false });
                }
            },
        });
    };

    const rejectPayment = (paymentId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Konfirmasi Tolak',
            message: 'Apakah Anda yakin ingin menolak pembayaran ini?',
            onConfirm: async () => {
                try {
                    await api.updatePaymentStatus(paymentId, 'rejected');
                    api.refreshData('jamaah-payments');
                    setConfirmModal({ ...confirmModal, isOpen: false });
                } catch (err) {
                    console.error("Gagal menolak:", err);
                    setError("Gagal menolak.");
                    setConfirmModal({ ...confirmModal, isOpen: false });
                }
            },
        });
    };

    const canManagePayments = hasRole(['owner', 'admin_staff', 'finance_staff']);

    return (
        <Modal title={`Manajemen Pembayaran: ${jamaah.full_name}`} onClose={onClose}>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700">Total Harga Paket</h4>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(mockPrice)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700">Total Terbayar (Lunas)</h4>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="text-sm font-medium text-red-700">Sisa Tagihan</h4>
                    <p className="text-xl font-bold text-red-900">{formatCurrency(remainingBalance)}</p>
                </div>
                {totalPending > 0 && (
                     <div className="p-4 bg-yellow-50 rounded-lg md:col-span-3">
                        <h4 className="text-sm font-medium text-yellow-700">Pembayaran Pending</h4>
                        <p className="text-lg font-semibold text-yellow-900">{formatCurrency(totalPending)}</p>
                    </div>
                )}
            </div>

            {canManagePayments && (
                <form onSubmit={saveJamaahPayment} className="mb-8 p-4 border rounded-lg bg-gray-50">
                    <h4 className="text-lg font-semibold mb-4">{newPayment.id ? 'Edit Pembayaran' : 'Tambah Pembayaran Baru'}</h4>
                    
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Jumlah"
                            name="amount"
                            type="number"
                            value={newPayment.amount}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Tanggal Bayar"
                            name="payment_date"
                            type="date"
                            value={newPayment.payment_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <Textarea
                            label="Deskripsi (Opsional)"
                            name="description"
                            value={newPayment.description}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Select
                            label="Metode Bayar"
                            name="payment_method"
                            value={newPayment.payment_method}
                            onChange={handleChange}
                        >
                            <option value="transfer">Transfer Bank</option>
                            <option value="cash">Tunai</option>
                            <option value="other">Lainnya</option>
                        </Select>

                        <div className="mb-4">
                            <label htmlFor="payment_proof_file" className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Bukti Pembayaran (Opsional)
                            </label>
                            <input
                                type="file"
                                id="payment_proof_file"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setFile(e.target.files[0])}
                                disabled={isSubmitting}
                            />
                            {!file && newPayment.proof_of_payment_url && (
                                <div className="mt-2 text-sm">
                                    Bukti tersimpan: {' '}
                                    <a href={newPayment.proof_of_payment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        Lihat Bukti
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {isSubmitting && <Loading text="Menyimpan..." />}

                    <div className="flex justify-end space-x-3 mt-4">
                        {(newPayment.id) && (
                            <button
                                type="button"
                                onClick={() => setNewPayment({ amount: '', payment_date: new Date().toISOString().split('T')[0], description: '', payment_method: 'transfer', status: 'pending', proof_of_payment_url: '' })}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                                disabled={isSubmitting}
                            >
                                Batal Edit
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Menyimpan...' : (newPayment.id ? 'Update Pembayaran' : 'Tambah Pembayaran')}
                        </button>
                    </div>
                </form>
            )}

            <h4 className="text-lg font-semibold mb-4">Riwayat Pembayaran</h4>
            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {payments.length === 0 && <li className="py-3 text-gray-500">Belum ada riwayat pembayaran.</li>}
                {payments.map(payment => (
                    <li key={payment.id} className="py-3 flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-600">{formatDate(payment.payment_date)} - {payment.payment_method}</p>
                            <p className="text-sm text-gray-500">{payment.description}</p>
                            {payment.proof_of_payment_url && (
                                <a href={payment.proof_of_payment_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                    Lihat Bukti
                                </a>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {payment.status}
                            </span>
                            {canManagePayments && (
                                <>
                                    {payment.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => verifyPayment(payment.id)}
                                                className="p-1 text-green-600 hover:text-green-800"
                                                title="Verifikasi"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => rejectPayment(payment.id)}
                                                className="p-1 text-red-600 hover:text-red-800"
                                                title="Tolak"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleEdit(payment)}
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => deletePayment(payment.id)}
                                        className="p-1 text-red-600 hover:text-red-800"
                                        title="Hapus"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {confirmModal.isOpen && (
                <Modal
                    title={confirmModal.title}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                >
                    <p className="mb-6">{confirmModal.message}</p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                        >
                            Batal
                        </button>
                        <button
                            onClick={confirmModal.onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Konfirmasi
                        </button>
                    </div>
                </Modal>
            )}

        </Modal>
    );
};

export default JamaahPaymentsModal;