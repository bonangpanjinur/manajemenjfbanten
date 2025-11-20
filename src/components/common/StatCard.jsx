import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
    // Mapping warna agar Tailwind mendeteksi class-nya
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        indigo: 'bg-indigo-500',
        red: 'bg-red-500',
        gray: 'bg-gray-500'
    };

    const bgColor = colorClasses[color] || 'bg-blue-500';

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`rounded-md p-3 ${bgColor} text-white flex items-center justify-center h-12 w-12`}>
                            <span className="text-2xl leading-none">{icon}</span>
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate uppercase">
                                {title}
                            </dt>
                            <dd>
                                <div className="text-lg font-bold text-gray-900">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;