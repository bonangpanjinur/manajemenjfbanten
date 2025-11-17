import React from 'react';

export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        // Hapus karakter non-numerik kecuali koma (untuk desimal jika ada)
        let numericString = String(amount).replace(/[^0-9,]/g, '');
        // Ganti koma dengan titik jika itu pemisah desimal
        numericString = numericString.replace(',', '.');
        amount = parseFloat(numericString) || 0;
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// --- PERBAIKAN (Kategori 4): Menambahkan fungsi parseCurrency ---
/**
 * Mengonversi string mata uang format IDR (misal: "Rp 1.500.000")
 * kembali menjadi angka (misal: 1500000).
 * @param {string} currencyString
 * @returns {number}
 */
export const parseCurrency = (currencyString) => {
    if (typeof currencyString === 'number') {
        return currencyString;
    }
    if (typeof currencyString !== 'string') {
        return 0;
    }
    
    try {
        // 1. Hapus "Rp" dan spasi
        // 2. Hapus titik pemisah ribuan
        // 3. Ganti koma pemisah desimal dengan titik (jika ada)
        // 4. Parse sebagai float
        const numberString = String(currencyString)
            .replace(/Rp\s?/g, '')
            .replace(/\./g, '')
            .replace(/,/g, '.');
            
        return parseFloat(numberString) || 0;
    } catch (e) {
        return 0;
    }
};
// --- AKHIR PERBAIKAN ---

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