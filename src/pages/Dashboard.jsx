import React, { useMemo } from 'react';
import { useApi } from '../context/ApiContext';
import { formatCurrency } from '../utils/helpers';
import { StatCard } from '../components/common/StatCard';
import { UserCheck, Package, DollarSign, CreditCard, UserX, Clock } from 'lucide-react';

const DashboardComponent = () => {
    const { jamaah, packages, tasks, finance } = useApi();

    const stats = useMemo(() => ({
        totalJamaah: jamaah.filter(j => j.status === 'approved').length,
        totalPackages: packages.filter(p => p.status === 'published').length,
        pendingJamaah: jamaah.filter(j => j.status === 'pending').length,
        pendingTasks: tasks.filter(t => t.status !== 'completed').length,
        totalRevenue: finance.filter(t => t.transaction_type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0),
        totalExpense: finance.filter(t => t.transaction_type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0),
    }), [jamaah, packages, tasks, finance]);

    return (
        <div className="dashboard-grid">
            <StatCard 
                title="Jemaah (Approved)" 
                value={stats.totalJamaah} 
                icon={<UserCheck size={24} />} 
                color="primary" 
            />
            <StatCard 
                title="Paket (Published)" 
                value={stats.totalPackages} 
                icon={<Package size={24} />} 
                color="success" 
            />
            <StatCard 
                title="Pemasukan" 
                value={formatCurrency(stats.totalRevenue)} 
                icon={<DollarSign size={24} />} 
                color="success" 
            />
             <StatCard 
                title="Pengeluaran" 
                value={formatCurrency(stats.totalExpense)} 
                icon={<CreditCard size={24} />} 
                color="danger" 
            />
            <StatCard 
                title="Jemaah (Pending)" 
                value={stats.pendingJamaah} 
                icon={<UserX size={24} />} 
                color="warning" 
            />
            <StatCard 
                title="Tugas (Pending)" 
                value={stats.pendingTasks} 
                icon={<Clock size={24} />} 
                color="warning" 
            />
        </div>
    );
};

export default DashboardComponent;