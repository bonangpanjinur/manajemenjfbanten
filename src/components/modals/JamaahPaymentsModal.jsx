import React, { useState } from 'react';
// PERBAIKAN: Path 2 level ke atas
import { useApi } from '../../context/ApiContext';
// PERBAIKAN: Impor bernama (named import) dan path 1 level ke atas
import { Modal, ModalFooter } from '../common/Modal';
import { Button, Select } from '../common/FormUI';
import { ErrorMessage } from '../common/ErrorMessage';
import { LoadingSpinner as Loading } from '../common/Loading';
// PERBAIKAN: Path 2 level ke atas
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Check, X, AlertTriangle, Clock } from 'lucide-react';

const JamaahPaymentsModal = ({ jamaah, onClose }) => {
    const { updatePaymentStatus, loading: apiLoading, error: apiError } = useApi();
    const [error, setError] = useState(null);
    const [loadingPaymentId, setLoadingPaymentId] = useState(null); // ID pembayaran yang sedang diupdate

    const payments = jamaah?.payments || [];
    const totalPaid = payments.reduce((acc, p) => p.status === 'paid' ? acc + p.amount : acc, 0);
    const totalPending = payments.reduce((acc, p) => p.status === 'pending' ? acc + p.amount : acc, 0);
    const packagePrice = jamaah?.package_price || 0;
    const remainingBalance = packagePrice - totalPaid;

    const handleStatusChange = async (paymentId, newStatus) => {
        setError(null);
        setLoadingPaymentId(paymentId);
        try {
            await updatePaymentStatus(paymentId, newStatus);
        } catch (err) {
            setError(err.message || 'Gagal mengupdate status.');
        } finally {
            setLoadingPaymentId(null);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'paid':
                return { icon: <Check className="w-4 h-4 text-green-500" />, text: 'Lunas', color: 'text-green-600' };
            case 'pending':
                return { icon: <Clock className="w-4 h-4 text-yellow-500" />, text: 'Pending', color: 'text-yellow-600' };
            case 'cancelled':
                return { icon: <X className="w-4 h-4 text-red-500" />, text: 'Dibatalkan', color: 'text-red-600' };
            default:
                return { icon: <AlertTriangle className="w-4 h-4 text-gray-500" />, text: 'Unknown', color: 'text-gray-600' };
        }
    };

    return (
        <Modal title={`Riwayat Pembayaran: ${jamaah.name}`} onClose={onClose}>
            <div className="p-6 space-y-4">
                {apiError && <ErrorMessage message={apiError} />}
                {error && <ErrorMessage message={error} />}

                {/* Ringkasan Keuangan */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatBox label="Total Tagihan" value={formatCurrency(packagePrice)} color="text-blue-600" />
                    <StatBox label="Total Lunas" value={formatCurrency(totalPaid)} color="text-green-600" />
                    <StatBox label="Tertunda" value={formatCurrency(totalPending)} color="text-yellow-600" />
                    <StatBox label="Sisa Tagihan" value={formatCurrency(remainingBalance)} color={remainingBalance > 0 ? "text-red-600" : "text-green-600"} />
                </div>

                {/* Daftar Pembayaran */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {payments.length === 0 ? (
                        <p className="text-center text-gray-500">Belum ada riwayat pembayaran.</p>
                    ) : (
                        payments.map(payment => {
                            const statusInfo = getStatusInfo(payment.status);
                            const isLoading = loadingPaymentId === payment.id;
                            
                            return (
                                <div key={payment.id} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1 mb-2 sm:mb-0">
                                        <div className="flex items-center">
                                            {statusInfo.icon}
                                            <span className={`ml-2 font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">{formatCurrency(payment.amount)}</p>
                                        <p className="text-sm text-gray-500">
                                            Metode: {payment.payment_method} | Tanggal: {formatDate(payment.payment_date)}
                                        </p>
                                        {payment.notes && <p className="text-xs text-gray-400 mt-1">Catatan: {payment.notes}</p>}
                                    </div>
                                    <div className="w-full sm:w-48">
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-10">
                                                <Loading />
                                            </div>
                                        ) : (
                                            <Select
                                                value={payment.status}
                                                onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                                                disabled={apiLoading}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Lunas</option>
                                                <option value="cancelled">Dibatalkan</option>
                                            </Select>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
            <ModalFooter>
                <Button variant="secondary" onClick={onClose} disabled={apiLoading}>
                    Tutup
                </Button>
            </ModalFooter>
        </Modal>
    );
};

// Komponen helper untuk stat box
const StatBox = ({ label, value, color }) => (
    <div className="p-3 bg-gray-50 rounded-lg text-center">
        <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
);

export default JamaahPaymentsModal;