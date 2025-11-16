import React from 'react';

// -- STYLING HELPER (PENGGANTI clsx) --
const cn = (...classes) => classes.filter(Boolean).join(' ');

export const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        primary: 'bg-blue-100 text-blue-600',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-600',
    };
    
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <div className={cn('p-3 rounded-full flex items-center justify-center', colorClasses[color] || colorClasses.primary)}>
                {icon}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 truncate">{value}</h3>
            </div>
        </div>
    );
};