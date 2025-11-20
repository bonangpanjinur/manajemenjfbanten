import React from 'react';

// Komponen Loading Spinner Kecil/Inline
export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const colorClasses = {
        blue: 'text-blue-600',
        white: 'text-white',
        gray: 'text-gray-600'
    };

    return (
        <svg 
            className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
        >
            <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
            ></circle>
            <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
};

// Komponen Loading Layar Penuh (Default)
const Loading = ({ text = 'Memuat data...' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-10 h-64 w-full">
            <LoadingSpinner size="lg" color="blue" />
            <p className="mt-4 text-gray-500 font-medium animate-pulse">{text}</p>
        </div>
    );
};

// PENTING: Ini yang memperbaiki error "export 'default' not found"
export default Loading;