import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', type = 'button', ...props }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500",
        icon: "p-2 text-gray-500 hover:bg-gray-100 rounded-full shadow-none border-none",
    };
    
    return (
        <button 
            type={type}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ label, className = '', error, ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input 
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Textarea = ({ label, className = '', error, ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea 
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Select = ({ label, children, className = '', error, ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <select 
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
            {...props}
        >
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Checkbox = ({ label, className = '', ...props }) => (
    <div className={`flex items-center ${className}`}>
        <input 
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...props}
        />
        {label && <label className="ml-2 block text-sm text-gray-900">{label}</label>}
    </div>
);

// --- KOMPONEN BARU (Ditambahkan untuk memperbaiki error build) ---

export const FormGroup = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const FormLabel = ({ children, htmlFor, className = '' }) => (
    <label 
        htmlFor={htmlFor} 
        className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
        {children}
    </label>
);