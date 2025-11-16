import React, { useMemo } from 'react';
import { useApi } from '../context/ApiContext'; // .jsx dihapus
import { StatCard } from '../components/common/StatCard'; // .jsx dihapus
import { LoadingSpinner } from '../components/common/Loading'; // .jsx dihapus
import { formatCurrency } from '../utils/helpers'; // .js dihapus
import { UserCheck, Package, DollarSign, CreditCard, UserX, Clock } from 'lucide-react';

const DashboardComponent = () => {
    const { stats, loadingStats, jamaah, tasks } = useApi(); // Ambil jamaah & tasks untuk stat pending
    
    // Gunakan data dari /stats/totals
    const { 
        total_jamaah = 0, 
        total_packages = 0, 
        total_revenue = 0, 
        total_expense = 0 
    } = stats.totals || {};
    
    // Hitung pending dari data client-side
    const pendingJamaah = useMemo(() => jamaah.filter(j => j.status === 'pending').length, [jamaah]);
    const pendingTasks = useMemo(() => tasks.filter(t => t.status !== 'completed').length, [tasks]);


    if (loadingStats) {
        return (
            <div className="bg-white shadow-lg rounded-lg p-6 relative min-h-[300px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
                title="Jemaah (Approved)" 
                value={total_jamaah} 
                icon={<UserCheck size={24} />} 
                color="primary" 
            />
            <StatCard 
                title="Paket (Published)" 
                value={total_packages} 
                icon={<Package size={24} />} 
                color="success" 
            />
            <StatCard 
                title="Pemasukan" 
                value={formatCurrency(total_revenue)} 
                icon={<DollarSign size={24} />} 
                color="success" 
            />
             <StatCard 
                title="Pengeluaran" 
                value={formatCurrency(total_expense)} 
                icon={<CreditCard size={24} />} 
                color="danger" 
            />
            <StatCard 
                title="Jemaah (Pending)" 
                value={pendingJamaah} 
                icon={<UserX size={24} />} 
                color="warning" 
            />
            <StatCard 
                title="Tugas (Pending)" 
                value={pendingTasks} 
                icon={<Clock size={24} />} 
                color="warning" 
            />
            {/* Di sini Anda bisa tambahkan Chart menggunakan stats.financeChart dan stats.packages */}
        </div>
    );
};

export default DashboardComponent;