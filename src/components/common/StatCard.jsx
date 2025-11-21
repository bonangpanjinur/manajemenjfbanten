import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
    // Mapping warna untuk background gradient
    const gradientClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        yellow: 'from-yellow-400 to-yellow-500',
        indigo: 'from-indigo-500 to-indigo-600',
        red: 'from-red-500 to-red-600',
        gray: 'from-gray-500 to-gray-600'
    };

    const bgGradient = gradientClasses[color] || 'from-blue-500 to-blue-600';

    return (
        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl border border-gray-100">
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 truncate uppercase tracking-wider">
                            {title}
                        </p>
                        <div className="mt-1 text-2xl font-extrabold text-gray-900">
                            {value}
                        </div>
                    </div>
                    <div className={`flex-shrink-0 rounded-lg p-3 bg-gradient-to-br ${bgGradient} text-white shadow-lg transform transition-transform hover:scale-105`}>
                        <span className="text-xl">{icon}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;