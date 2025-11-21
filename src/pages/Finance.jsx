import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import FinanceForm from '../components/forms/FinanceForm'; // Komponen Baru
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const Finance = () => {
  const { api } = useApi();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('income'); // income, expense, loan

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/transactions');
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFinance(); }, []);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Hitung Saldo
  const totalIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Keuangan & Kas</h1>
        <div className="flex gap-2">
            <button onClick={() => openModal('expense')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-200">
                <TrendingDown size={16}/> Pengeluaran / Operasional
            </button>
            <button onClick={() => openModal('loan')} className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-200">
                <Wallet size={16}/> Kasbon Karyawan
            </button>
             {/* Tombol Pembayaran Jemaah biasanya via Menu Jemaah, tapi bisa ditambah shortcut disini jika mau */}
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Total Pemasukan</p>
            <h3 className="text-2xl font-bold text-gray-800">Rp {totalIn.toLocaleString()}</h3>
         </div>
         <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold text-gray-800">Rp {totalOut.toLocaleString()}</h3>
         </div>
         <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Saldo Akhir</p>
            <h3 className="text-2xl font-bold text-gray-800">Rp {(totalIn - totalOut).toLocaleString()}</h3>
         </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b uppercase text-gray-500">
                <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Keterangan</th>
                    <th className="p-4 text-right">Nominal</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {transactions.map(t => (
                    <tr key={t.id}>
                        <td className="p-4">{t.transaction_date}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {t.category}
                            </span>
                        </td>
                        <td className="p-4">{t.description}</td>
                        <td className={`p-4 text-right font-mono font-medium ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'in' ? '+' : '-'} Rp {parseFloat(t.amount).toLocaleString()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'loan' ? 'Catat Kasbon Karyawan' : 'Catat Pengeluaran Operasional'}>
         <FinanceForm type={modalType} onSuccess={() => { setIsModalOpen(false); fetchFinance(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
export default Finance;