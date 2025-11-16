import React, { useState, useMemo } from 'react';
import { useApi } from '../context/ApiContext'; // .jsx dihapus
import FinanceForm from '../components/forms/FinanceForm'; // .jsx dihapus
import { Modal } from '../components/common/Modal'; // .jsx dihapus
import { LoadingSpinner } from '../components/common/Loading'; // .jsx dihapus
import { ErrorMessage } from '../components/common/ErrorMessage'; // .jsx dihapus
import { Button, Select, FormLabel } from '../components/common/FormUI'; // .jsx dihapus
import { formatCurrency, formatDate } from '../utils/helpers'; // .js dihapus
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

// -- STYLING HELPER (PENGGANTI clsx) --
const cn = (...classes) => classes.filter(Boolean).join(' ');

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
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm && window.confirm('Yakin ingin menghapus transaksi ini?')) {
            try {
                await deleteFinance(id);
            } catch (e) {
                alert(`Error: ${e.message}`);
            }
        }
    };

    const kasData = useMemo(() => {
        const filtered = finance
            .filter(trx => !selectedAccountId || trx.account_id == selectedAccountId)
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
        <div className="bg-white shadow-lg rounded-lg p-6 relative min-h-[300px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Buku Kas</h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Catat Transaksi
                </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full md:w-auto">
                    <FormLabel htmlFor="filter-akun">Tampilkan Akun</FormLabel>
                    <Select id="filter-akun" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>
                        <option value="">Semua Akun Kas</option>
                        {financeAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </Select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2"><CheckCircle size={16} /> Total Kredit (Masuk)</h4>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(kasData.totalKredit)}</p>
                </div>
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2"><AlertCircle size={16} /> Total Debit (Keluar)</h4>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(kasData.totalDebit)}</p>
                </div>
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2"><DollarSign size={16} /> Saldo Akhir</h4>
                    <p className={cn(
                        "text-2xl font-bold",
                        kasData.saldoAkhir < 0 ? 'text-red-600' : 'text-gray-900'
                    )}>
                        {formatCurrency(kasData.saldoAkhir)}
                    </p>
                </div>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {kasData.transactions.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Tidak ada transaksi.</td>
                                </tr>
                            )}
                            {kasData.transactions.map(trx => {
                                const account = financeAccounts.find(a => a.id == trx.account_id);
                                return (
                                    <tr key={trx.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(trx.transaction_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trx.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{account ? account.name : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{trx.debit ? formatCurrency(trx.debit) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{trx.kredit ? formatCurrency(trx.kredit) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{formatCurrency(trx.balance)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                            <Button variant="icon" size="sm" onClick={() => handleOpenModal(trx)} title="Edit Transaksi">
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button variant="icon" size="sm" className="text-red-600 hover:bg-red-100" onClick={() => handleDelete(trx.id)} title="Hapus Transaksi">
                                                <Trash2 size={16} />
                                            </Button>
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
                size="2xl"
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