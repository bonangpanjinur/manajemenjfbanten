import React, { useState, useEffect, useMemo } from 'react';
// PERBAIKAIKAN: Menambahkan ekstensi .jsx
import { useApi } from '../context/ApiContext.jsx';
// PERBAIKAN: Menambahkan ekstensi .js
import { formatCurrency, formatDate } from '../utils/helpers.js';
// PERBAIKAN: Menambahkan ekstensi .jsx
import { Modal } from '../components/common/Modal.jsx';
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { ErrorMessage } from '../components/common/ErrorMessage.jsx';
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
// PERBAIKAN: Import form dari file terpisah dan tambahkan ekstensi .jsx
import FinanceForm from '../components/forms/FinanceForm.jsx';


// Komponen Halaman Utama Keuangan
const FinanceComponent = () => {
    // ... existing code ...
    const { finance, financeAccounts, saveFinance, deleteFinance, loading, error } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState(''); 

    const handleOpenModal = (trx = null) => {
// ... existing code ...
        setSelectedTrx(trx);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
// ... existing code ...
        setIsModalOpen(false);
        setSelectedTrx(null);
    };
// ... existing code ...
    const handleSave = async (trx) => {
        try {
            await saveFinance(trx);
// ... existing code ...
            handleCloseModal();
        } catch (error) {
            alert(`Error: ${error.message}`);
// ... existing code ...
        }
    };

    const handleDelete = async (id) => {
// ... existing code ...
        if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
            try {
                await deleteFinance(id);
// ... existing code ...
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
// ... existing code ...
        }
    };

    const kasData = useMemo(() => {
// ... existing code ...
        const filtered = finance
            .filter(trx => selectedAccountId ? trx.account_id == selectedAccountId : true)
            .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));
        
        let totalDebit = 0;
// ... existing code ...
        let totalKredit = 0;
        let runningBalance = 0;

        const transactionsWithBalance = filtered.map(trx => {
// ... existing code ...
            const amount = parseFloat(trx.amount) || 0;
            let debit = 0;
// ... existing code ...
            let kredit = 0;

            if (trx.transaction_type === 'expense') {
                debit = amount;
// ... existing code ...
                totalDebit += amount;
                runningBalance -= amount;
            } else {
// ... existing code ...
                kredit = amount;
                totalKredit += amount;
                runningBalance += amount;
// ... existing code ...
            }
            
            return { ...trx, debit, kredit, balance: runningBalance };
// ... existing code ...
        });

        return {
            transactions: transactionsWithBalance.reverse(), // Tampilkan dari terbaru
// ... existing code ...
            totalDebit,
            totalKredit,
            saldoAkhir: runningBalance,
// ... existing code ...
        };
    }, [finance, selectedAccountId]);

    return (
// ... existing code ...
        <div className="umh-component-container">
            <div className="umh-table-toolbar">
                <h2>Buku Kas</h2>
// ... existing code ...
                <button className="umh-button" onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Catat Transaksi
                </button>
            </div>

            <div className="umh-sub-header">
// ... existing code ...
                <div className="filter-group">
                    <label>Tampilkan Akun:</label>
                    <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>
// ... existing code ...
                        <option value="">Semua Akun Kas</option>
                        {financeAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
// ... existing code ...
                        ))}
                    </select>
                </div>
// ... existing code ...
            </div>
            
            <div className="finance-summary">
                <div className="summary-card">
// ... existing code ...
                    <h4><CheckCircle size={16} /> Total Kredit (Masuk)</h4>
                    <p className="kredit">{formatCurrency(kasData.totalKredit)}</p>
                </div>
// ... existing code ...
                 <div className="summary-card">
                    <h4><AlertCircle size={16} /> Total Debit (Keluar)</h4>
                    <p className="debit">{formatCurrency(kasData.totalDebit)}</p>
// ... existing code ...
                </div>
                 <div className="summary-card">
                    <h4><DollarSign size={16} /> Saldo Akhir</h4>
// ... existing code ...
                    <p className="saldo">{formatCurrency(kasData.saldoAkhir)}</p>
                </div>
            </div>
// ... existing code ...
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="umh-table-wrapper">
// ... existing code ...
                    <table className="umh-table">
                        <thead>
                            <tr>
// ... existing code ...
                                <th>Tanggal</th>
                                <th>Deskripsi</th>
                                <th>Akun</th>
// ... existing code ...
                                <th>Debit</th>
                                <th>Kredit</th>
                                <th>Saldo</th>
// ... existing code ...
                                <th>Aksi</th>
                            </tr>
                        </thead>
// ... existing code ...
                        <tbody>
                            {kasData.transactions.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', padding: '16px'}}>Tidak ada transaksi.</td></tr>}
                            {kasData.transactions.map(trx => {
// ... existing code ...
                                const account = financeAccounts.find(a => a.id == trx.account_id);
                                return (
                                    <tr key={trx.id}>
                                        <td>{formatDate(trx.transaction_date)}</td>
// ... existing code ...
                                        <td>{trx.description}</td>
                                        <td>{account ? account.name : 'N/A'}</td>
                                        <td>{trx.debit ? formatCurrency(trx.debit) : '-'}</td>
// ... existing code ...
                                        <td>{trx.kredit ? formatCurrency(trx.kredit) : '-'}</td>
                                        <td>{formatCurrency(trx.balance)}</td>
                                        <td className="actions">
// ... existing code ...
                                            <Edit2 size={18} className="action-icon" onClick={() => handleOpenModal(trx)} title="Edit Transaksi" />
                                            <Trash2 size={18} className="action-icon danger" onClick={() => handleDelete(trx.id)} title="Hapus Transaksi" />
                                        </td>
// ... existing code ...
                                    </tr>
                                );
                            })}
                        </tbody>
// ... existing code ...
                    </table>
                </div>
            )}

            <Modal
// ... existing code ...
                title={selectedTrx ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            >
                {/* PERBAIKAN: Gunakan komponen Form yang di-import */}
                <FinanceForm
                    initialData={selectedTrx}
// ... existing code ...
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                    accounts={financeAccounts}
                />
            </Modal>
        </div>
    );
};

export default FinanceComponent;