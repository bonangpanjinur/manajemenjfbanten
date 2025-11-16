import React from 'react';
import { X } from 'lucide-react';
import { Button } from './FormUI.jsx'; // Impor Button dari file UI baru

// -- STYLING HELPER (PENGGANTI clsx) --
const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Modal = ({ title, isOpen, onClose, children, footer, size = '3xl' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-[1000] overflow-y-auto pt-16" 
            onClick={onClose}
        >
            <div 
                className={cn(
                    'bg-white rounded-lg shadow-xl w-full m-auto flex flex-col max-h-[90vh]',
                    sizeClasses[size] || 'max-w-3xl'
                )} 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg z-10">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                {footer && (
                    <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0 z-10">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ModalFooter = ({ onCancel, submitText = 'Simpan', children }) => (
    <>
        <Button onClick={onCancel} variant="secondary">Batal</Button>
        <Button type="submit" variant="primary">{submitText}</Button>
        {children}
    </>
);