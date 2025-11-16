import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ title, isOpen, onClose, children, footer, size = '800px' }) => {
    if (!isOpen) return null;
    return (
        <div className="umh-modal-overlay" onClick={onClose}>
            <div className="umh-modal-content" style={{ maxWidth: size }} onClick={e => e.stopPropagation()}>
                <div className="umh-modal-header">
                    <h3>{title}</h3>
                    <X className="close-button" onClick={onClose} />
                </div>
                <div className="umh-modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="umh-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ModalFooter = ({ onCancel, submitText = 'Simpan' }) => (
    <div className="umh-modal-footer">
        <button type="button" className="umh-button secondary" onClick={onCancel}>Batal</button>
        <button type="submit" className="umh-button">{submitText}</button>
    </div>
);