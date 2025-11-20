import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

// Sub-komponen untuk Footer (Opsional, tapi sering dipakai)
export const ModalFooter = ({ children, className = '' }) => (
    <div className={`flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100 ${className}`}>
        {children}
    </div>
);

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md', // sm, md, lg, xl, full
    noPadding = false 
}) => {
    // Tutup modal dengan tombol ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop Gelap */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div 
                    className={`relative bg-white rounded-xl shadow-2xl w-full transform transition-all ${sizeClasses[size]}`}
                    onClick={e => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-5 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Body */}
                    <div className={noPadding ? '' : 'p-6'}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// PENTING: Export Default agar bisa diimport dengan `import Modal from ...`
export default Modal;