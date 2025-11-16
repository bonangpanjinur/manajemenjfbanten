import React from 'react';

export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-'; 
        // Menggunakan toLocaleDateString lebih aman untuk zona waktu
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC' // Asumsikan tanggal dari DB adalah UTC/Date-only
        });
    } catch (e) {
        return dateString;
    }
};

export const formatDateForInput = (dateString) => {
     if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        // ISO string: 2023-01-01T00:00:00.000Z
        // Ambil bagian YYYY-MM-DD
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
}

export const getStatusBadge = (status) => {
    const statusText = (status || 'pending').replace(/_/g, ' ');
    const statusClass = statusText.toLowerCase()
        .replace(/ /g, '_')
        .replace(/[^a-z0-9_]/g, '');
    return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
};