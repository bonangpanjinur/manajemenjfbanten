// File: src/components/common/FormUI.jsx

import React from 'react';

export const Input = ({ label, type = 'text', className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input
            type={type}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm ${className}`}
            {...props}
        />
    </div>
);

export const Select = ({ label, children, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <select
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-white ${className}`}
            {...props}
        >
            {children}
        </select>
    </div>
);

export const Textarea = ({ label, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm resize-none ${className}`}
            {...props}
        ></textarea>
    </div>
);

// Tambahkan komponen Button ini agar WARNING hilang
export const Button = ({ children, className = '', type = 'button', ...props }) => (
    <button
        type={type}
        className={`px-4 py-2 rounded-lg font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
    >
        {children}
    </button>
);