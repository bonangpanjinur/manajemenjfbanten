import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../context/ApiContext';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/helpers';
import { Modal, ModalFooter } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

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
        if(initialData) {
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


// Komponen Halaman Utama Keuangan
const FinanceComponent = () => {
    const { finance, financeAccounts, saveFinance, deleteFinance, loading, error } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState(''); 

    const handleOpenModal = (trx = null) => {
        setSelectedTrx(trx);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTrx(null);
    };

    const handleSave = async (trx) => {
        try {
            await saveFinance(trx);
            handleCloseModal();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
            try {
                await deleteFinance(id);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };

    const kasData = useMemo(() => {
        const filtered = finance
            .filter(trx => selectedAccountId ? trx.account_id == selectedAccountId : true)
            .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));
        
        let totalDebit = 0;
        let totalKredit = 0;
        let runningBalance = 0;

        const transactionsWithBalance = filtered.map(trx => {
            const amount = parseFloat(trx.amount) || 0;
            let debit = 0;
            let kredit = 0;

            if (trx.transaction_type === 'expense') {
                debit = amount;
                totalDebit += amount;
                runningBalance -= amount;
            } else {
                kredit = amount;
                totalKredit += amount;
                runningBalance += amount;
            }
            
            return { ...trx, debit, kredit, balance: runningBalance };
        });

        return {
            transactions: transactionsWithBalance.reverse(), // Tampilkan dari terbaru
            totalDebit,
            totalKredit,
            saldoAkhir: runningBalance,
        };
    }, [finance, selectedAccountId]);

    return (
        <div className="umh-component-container">
            <div className="umh-table-toolbar">
                <h2>Buku Kas</h2>
                <button className="umh-button" onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Catat Transaksi
                </button>
            </div>

            <div className="umh-sub-header">
                <div className="filter-group">
                    <label>Tampilkan Akun:</label>
                    <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>
                        <option value="">Semua Akun Kas</option>
                        {financeAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="finance-summary">
                <div className="summary-card">
                    <h4><CheckCircle size={16} /> Total Kredit (Masuk)</h4>
                    <p className="kredit">{formatCurrency(kasData.totalKredit)}</p>
                </div>
                 <div className="summary-card">
                    <h4><AlertCircle size={16} /> Total Debit (Keluar)</h4>
                    <p className="debit">{formatCurrency(kasData.totalDebit)}</p>
                </div>
                 <div className="summary-card">
                    <h4><DollarSign size={16} /> Saldo Akhir</h4>
                    <p className="saldo">{formatCurrency(kasData.saldoAkhir)}</p>
                </div>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="umh-table-wrapper">
                    <table className="umh-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Deskripsi</th>
                                <th>Akun</th>
                                <th>Debit</th>
                                <th>Kredit</th>
                                <th>Saldo</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kasData.transactions.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', padding: '16px'}}>Tidak ada transaksi.</td></tr>}
                            {kasData.transactions.map(trx => {
                                const account = financeAccounts.find(a => a.id == trx.account_id);
                                return (
                                    <tr key={trx.id}>
                                        <td>{formatDate(trx.transaction_date)}</td>
                                        <td>{trx.description}</td>
                                        <td>{account ? account.name : 'N/A'}</td>
                                        <td>{trx.debit ? formatCurrency(trx.debit) : '-'}</td>
                                        <td>{trx.kredit ? formatCurrency(trx.kredit) : '-'}</td>
                                        <td>{formatCurrency(trx.balance)}</td>
                                        <td className="actions">
                                            <Edit2 size={18} className="action-icon" onClick={() => handleOpenModal(trx)} title="Edit Transaksi" />
                                            <Trash2 size={18} className="action-icon danger" onClick={() => handleDelete(trx.id)} title="Hapus Transaksi" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                title={selectedTrx ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            >
                <FinanceForm
                    initialData={selectedTrx}
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                    accounts={financeAccounts}
                />
            </Modal>
        </div>
    );
};

export default FinanceComponent;