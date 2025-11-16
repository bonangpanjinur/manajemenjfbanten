import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext'; // .jsx dihapus
import { Modal } from '../common/Modal'; // .jsx dihapus
import { LoadingSpinner } from '../common/Loading'; // .jsx dihapus
import { formatCurrency, formatDate, formatDateForInput, getStatusBadge } from '../../utils/helpers'; // .js dihapus
import { Button, Input, FormGroup, FormLabel } from '../common/FormUI'; // .jsx dihapus
import { CheckCircle, XCircle, Trash2, Plus } from 'lucide-react'; // XSquare diganti

// -- STYLING HELPER (PENGGANTI clsx) --
const cn = (...classes) => classes.filter(Boolean).join(' ');

const JamaahPaymentsModal = ({ isOpen, onClose, jamaah }) => {
    const api = useApi();
    const { 
        jamaahPayments, 
        loadingPayments, 
        fetchJamaahPayments, 
        saveJamaahPayment, 
        deleteJamaahPayment 
    } = api;
    
    const [newPayment, setNewPayment] = useState({
        amount: '',
        description: '',
        payment_date: formatDateForInput(new Date()),
    });

    useEffect(() => {
        if (isOpen && jamaah) {
            fetchJamaahPayments(jamaah.id);
        } else if (!isOpen) {
            // Kosongkan state payments saat modal ditutup
            fetchJamaahPayments(null); 
        }
    }, [isOpen, jamaah, fetchJamaahPayments]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPayment(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewPayment = async (e) => {
        e.preventDefault();
        if (!newPayment.amount || !newPayment.payment_date) {
            alert("Jumlah dan Tanggal wajib diisi.");
            return;
        }
        try {
            await saveJamaahPayment(jamaah.id, newPayment);
            setNewPayment({
                amount: '',
                description: '',
                payment_date: formatDateForInput(new Date()),
            });
        } catch (error) {
            alert(`Gagal menyimpan: ${error.message}`);
        }
    };

    const handleVerifyPayment = async (payment) => {
        if (window.confirm && !window.confirm("Anda yakin ingin MEMVERIFIKASI pembayaran ini?")) return;
        try {
            await saveJamaahPayment(jamaah.id, { ...payment, status: 'verified' });
        } catch (error) {
            alert(`Gagal verifikasi: ${error.message}`);
        }
    };
    
    const handleRejectPayment = async (payment) => {
         if (window.confirm && !window.confirm("Anda yakin ingin MENOLAK pembayaran ini?")) return;
        try {
            await saveJamaahPayment(jamaah.id, { ...payment, status: 'rejected' });
        } catch (error) {
            alert(`Gagal menolak: ${error.message}`);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm && !window.confirm("Anda yakin ingin MENGHAPUS riwayat pembayaran ini? Ini tidak bisa dikembalikan.")) return;
        try {
            await deleteJamaahPayment(jamaah.id, paymentId);
        } catch (error) {
            alert(`Gagal menghapus: ${error.message}`);
        }
    };
    
    if (!jamaah) return null;

    // Ambil data jemaah terbaru dari API context untuk Tampilan Saldo
    const updatedJamaah = api.jamaah.find(j => j.id === jamaah.id) || jamaah;
    const sisaTagihan = (updatedJamaah.total_price || 0) - (updatedJamaah.amount_paid || 0);

    return (
        <Modal 
            title={`Riwayat Pembayaran: ${updatedJamaah.full_name}`} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            {loadingPayments && <LoadingSpinner />}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500">Total Tagihan</h4>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(updatedJamaah.total_price)}</p>
                </div>
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500">Total Terbayar (Verified)</h4>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(updatedJamaah.amount_paid)}</p>
                </div>
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500">Sisa Tagihan</h4>
                    <p className={cn(
                        "text-2xl font-bold",
                        sisaTagihan > 0 ? 'text-red-600' : 'text-green-600'
                    )}>
                        {formatCurrency(sisaTagihan)}
                    </p>
                </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mb-3">Riwayat Transaksi</h4>
            <ul className="divide-y divide-gray-200">
                {jamaahPayments.length === 0 && !loadingPayments && (
                    <li className="py-3 text-center text-gray-500">Tidak ada riwayat pembayaran.</li>
                )}
                {jamaahPayments.map(p => (
                    <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <strong className="text-base font-medium text-gray-900">{formatCurrency(p.amount)}</strong>
                            <span className="block text-sm text-gray-500">{p.description || 'Pembayaran'} - {formatDate(p.payment_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {getStatusBadge(p.status)}
                            {p.status === 'pending' && (
                                <>
                                <Button 
                                    variant="icon" 
                                    size="sm"
                                    className="text-green-600 hover:bg-green-100"
                                    onClick={() => handleVerifyPayment(p)}
                                    title="Verifikasi"
                                >
                                    <CheckCircle size={18} />
                                </Button>
                                <Button 
                                    variant="icon" 
                                    size="sm"
                                    className="text-yellow-600 hover:bg-yellow-100"
                                    onClick={() => handleRejectPayment(p)}
                                    title="Tolak"
                                >
                                    <XCircle size={18} />
                                </Button>
                                </>
                            )}
                             <Button 
                                variant="icon"
                                size="sm"
                                className="text-red-600 hover:bg-red-100"
                                onClick={() => handleDeletePayment(p.id)} 
                                title="Hapus"
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleAddNewPayment} className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Tambah Pembayaran Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup>
                        <FormLabel htmlFor="pay-amount">Jumlah (Rp)</FormLabel>
                        <Input
                            type="number"
                            name="amount"
                            id="pay-amount"
                            value={newPayment.amount}
                            onChange={handleInputChange}
                            required
                        />
                    </FormGroup>
                     <FormGroup>
                        <FormLabel htmlFor="pay-date">Tanggal Bayar</FormLabel>
                        <Input
                            type="date"
                            name="payment_date"
                            id="pay-date"
                            value={newPayment.payment_date}
                            onChange={handleInputChange}
                            required
                        />
                    </FormGroup>
                </div>
                <FormGroup>
                    <FormLabel htmlFor="pay-desc">Keterangan (Cth: DP, Cicilan 1, Pelunasan)</FormLabel>
                    <Input
                        type="text"
                        name="description"
                        id="pay-desc"
                        value={newPayment.description}
                        onChange={handleInputChange}
                    />
                </FormGroup>
                <Button type="submit" variant="primary">
                    <Plus size={16} /> Tambah
                </Button>
            </form>
        </Modal>
    );
};

export default JamaahPaymentsModal;