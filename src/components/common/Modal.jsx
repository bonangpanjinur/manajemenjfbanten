import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './FormUI.jsx';

// -- STYLING HELPER --
const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Modal = ({ title, isOpen, onClose, children, footer, size = '3xl' }) => {
    // Mencegah scroll pada body utama saat modal terbuka
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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
        // Z-Index 100000 untuk memastikan di atas WP Admin Bar
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-start justify-center p-4 z-[100000] overflow-y-auto pt-10 sm:pt-20" 
            onClick={onClose}
        >
            <div 
                className={cn(
                    'bg-white rounded-xl shadow-2xl w-full m-auto flex flex-col max-h-[90vh] transform transition-all',
                    sizeClasses[size] || 'max-w-3xl'
                )} 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl sticky bottom-0 z-10">
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