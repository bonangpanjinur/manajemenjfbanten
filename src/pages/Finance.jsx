// File Location: src/pages/Finance.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import FinanceForm from '../components/forms/FinanceForm';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import { FaMoneyBillWave } from 'react-icons/fa';

const Finance = () => {
    const { getFinanceStats, getCashFlow, getPayments } = useApi();
    const [stats, setStats] = useState({ total_in: 0, total_out: 0, balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [activeTab, setActiveTab] = useState('cashflow'); 
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('operational');

    const fetchData = async () => {
        setLoading(true);
        try {
            const statRes = await getFinanceStats();
            setStats(statRes || { total_in: 0, total_out: 0, balance: 0 });
            if (activeTab === 'cashflow') {
                const flowRes = await getCashFlow();
                setTransactions(flowRes || []);
            } else {
                const payRes = await getPayments();
                setPayments(payRes || []);
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(n);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Keuangan & Kas</h1>
                <div className="flex gap-2">
                    <button onClick={() => { setModalMode('operational'); setIsModalOpen(true); }} className="bg-gray-800 text-white px-4 py-2 rounded shadow">Input Kas Ops</button>
                    <button onClick={() => { setModalMode('payment'); setIsModalOpen(true); }} className="bg-green-600 text-white px-4 py-2 rounded shadow">Input Bayar Jamaah</button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded shadow border-l-4 border-green-500">
                    <p className="text-gray-500 text-sm">Total Masuk</p>
                    <h3 className="text-2xl font-bold">{formatIDR(stats.total_in)}</h3>
                </div>
                <div className="bg-white p-5 rounded shadow border-l-4 border-red-500">
                    <p className="text-gray-500 text-sm">Total Keluar</p>
                    <h3 className="text-2xl font-bold">{formatIDR(stats.total_out)}</h3>
                </div>
                <div className="bg-white p-5 rounded shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm">Saldo Kas</p>
                    <h3 className="text-2xl font-bold text-blue-600">{formatIDR(stats.balance)}</h3>
                </div>
            </div>

            <div className="bg-white shadow rounded overflow-hidden">
                <div className="flex border-b">
                    <button onClick={() => setActiveTab('cashflow')} className={`flex-1 py-3 ${activeTab === 'cashflow' ? 'bg-blue-50 border-b-2 border-blue-500' : ''}`}>Arus Kas</button>
                    <button onClick={() => setActiveTab('payments')} className={`flex-1 py-3 ${activeTab === 'payments' ? 'bg-blue-50 border-b-2 border-blue-500' : ''}`}>Pembayaran Jamaah</button>
                </div>
                <div className="overflow-x-auto">
                    {loading ? <Loading /> : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">{activeTab === 'cashflow' ? 'Deskripsi' : 'Jamaah'}</th>
                                    <th className="p-3 text-right">Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'cashflow' ? transactions.map(t => (
                                    <tr key={t.id} className="border-b">
                                        <td className="p-3">{t.transaction_date}</td>
                                        <td className="p-3">
                                            <span className={`mr-2 px-2 rounded text-xs ${t.type==='in'?'bg-green-100':'bg-red-100'}`}>{t.type==='in'?'IN':'OUT'}</span>
                                            {t.description}
                                        </td>
                                        <td className="p-3 text-right font-bold">{formatIDR(t.amount)}</td>
                                    </tr>
                                )) : payments.map(p => (
                                    <tr key={p.id} className="border-b">
                                        <td className="p-3">{p.payment_date}</td>
                                        <td className="p-3">{p.full_name}</td>
                                        <td className="p-3 text-right text-green-600 font-bold">{formatIDR(p.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'operational' ? 'Input Kas' : 'Bayar Jamaah'}>
                <FinanceForm mode={modalMode} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Finance;