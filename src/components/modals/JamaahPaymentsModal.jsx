import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { formatCurrency, formatDate, formatDateForInput, getStatusBadge } from '../../utils/helpers';
import { Modal } from '../common/Modal';
import { Trash2, CheckCircle, XSquare, Plus } from 'lucide-react';

// Modal Pembayaran Jemaah (Dipisah)
const JamaahPaymentsModal = ({ isOpen, onClose, jamaah }) => {
    const api = useApi(); // Gunakan hook di dalam komponen
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
            fetchJamaahPayments(null); // Clear payments saat modal ditutup
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
        if (!confirm("Anda yakin ingin MEMVERIFIKASI pembayaran ini?")) return;
        try {
            await saveJamaahPayment(jamaah.id, { ...payment, status: 'verified' });
        } catch (error) {
            alert(`Gagal verifikasi: ${error.message}`);
        }
    };
    
    const handleRejectPayment = async (payment) => {
         if (!confirm("Anda yakin ingin MENOLAK pembayaran ini?")) return;
        try {
            await saveJamaahPayment(jamaah.id, { ...payment, status: 'rejected' });
        } catch (error) {
            alert(`Gagal menolak: ${error.message}`);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (!confirm("Anda yakin ingin MENGHAPUS riwayat pembayaran ini? Ini tidak bisa dikembalikan.")) return;
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
            {loadingPayments && <p>Memuat riwayat...</p>}
            
            <div className="finance-summary" style={{ marginBottom: '20px' }}>
                 <div className="summary-card">
                    <h4>Total Tagihan</h4>
                    <p>{formatCurrency(updatedJamaah.total_price)}</p>
                </div>
                 <div className="summary-card">
                    <h4>Total Terbayar (Verified)</h4>
                    <p className="kredit">{formatCurrency(updatedJamaah.amount_paid)}</p>
                </div>
                 <div className="summary-card">
                    <h4>Sisa Tagihan</h4>
                    <p className="debit">{formatCurrency(sisaTagihan)}</p>
                </div>
            </div>

            <h4 style={{ margin: '15px 0 10px 0' }}>Riwayat Transaksi</h4>
            <ul className="payment-history-list">
                {jamaahPayments.length === 0 && !loadingPayments && <li>Tidak ada riwayat pembayaran.</li>}
                {jamaahPayments.map(p => (
                    <li key={p.id}>
                        <div className="payment-info">
                            <strong>{formatCurrency(p.amount)}</strong>
                            <span>{p.description || 'Pembayaran'} - {formatDate(p.payment_date)}</span>
                        </div>
                        <div className="payment-actions">
                            {getStatusBadge(p.status)}
                            {p.status === 'pending' && (
                                <>
                                <button 
                                    className="umh-button" 
                                    style={{ padding: '4px 8px', fontSize: '0.8em', background: 'var(--success)'}}
                                    onClick={() => handleVerifyPayment(p)}
                                    title="Verifikasi"
                                >
                                    <CheckCircle size={14} />
                                </button>
                                <button 
                                    className="umh-button secondary" 
                                    style={{ padding: '4px 8px', fontSize: '0.8em', background: 'var(--warning)'}}
                                    onClick={() => handleRejectPayment(p)}
                                    title="Tolak"
                                >
                                    <XSquare size={14} />
                                </button>
                                </>
                            )}
                             <Trash2 
                                size={18} 
                                className="action-icon danger" 
                                onClick={() => handleDeletePayment(p.id)} 
                                title="Hapus"
                            />
                        </div>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleAddNewPayment} className="payment-form">
                <h4 style={{ margin: '0 0 15px 0' }}>Tambah Pembayaran Baru</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Jumlah (Rp)</label>
                        <input
                            type="number"
                            name="amount"
                            value={newPayment.amount}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                     <div className="form-group">
                        <label>Tanggal Bayar</label>
                        <input
                            type="date"
                            name="payment_date"
                            value={newPayment.payment_date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-group full-width">
                    <label>Keterangan (Cth: DP, Cicilan 1, Pelunasan)</label>
                    <input
                        type="text"
                        name="description"
                        value={newPayment.description}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="umh-button">
                    <Plus size={16} /> Tambah
                </button>
            </form>
        </Modal>
    );
};

export default JamaahPaymentsModal;