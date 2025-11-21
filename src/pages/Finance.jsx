import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import { DollarSign, CreditCard, TrendingUp, Printer, Search } from 'lucide-react';

const Finance = () => {
  const { api } = useApi();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- FUNGSI CETAK KWITANSI ---
  const handlePrint = (paymentId) => {
    // URL ini mengarah ke admin-post.php WordPress yang di-hook oleh api-print.php
    const printUrl = `/wp-admin/admin-post.php?action=umh_print_receipt&id=${paymentId}`;
    window.open(printUrl, '_blank', 'width=900,height=600');
  };

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await api.get('/finance/transactions');
        setPayments(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  if (loading) return <div className="p-6"><Loading /></div>;

  const totalIn = payments.filter(p => p.type === 'in').reduce((acc, curr) => acc + parseInt(curr.amount), 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Keuangan & Pembayaran</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><TrendingUp size={24}/></div>
            <div><p className="text-sm text-gray-500">Total Pemasukan</p><h3 className="text-xl font-bold">Rp {totalIn.toLocaleString()}</h3></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <div className="p-4 border-b bg-gray-50 font-medium text-gray-700">Riwayat Pembayaran Jamaah</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b text-gray-500 uppercase">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Jamaah</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4 text-center">Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50">
                  <td className="p-4">{new Date(pay.payment_date).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 font-medium">
                    {pay.jamaah_name} <br/>
                    <span className="text-xs text-gray-400">{pay.booking_code}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${pay.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {pay.status === 'verified' ? 'Terverifikasi' : 'Menunggu'}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{pay.payment_method}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-700">Rp {parseInt(pay.amount).toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <button 
                        onClick={() => handlePrint(pay.id)}
                        className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Cetak Kwitansi"
                    >
                        <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;