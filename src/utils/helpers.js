/**
 * Helpers Utility
 */

// Format Rupiah
export const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Format Tanggal Indonesia
export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

/**
 * Mengambil URL aset yang valid untuk WordPress plugin
 * @param {string} path - Path relatif terhadap folder assets/ (contoh: 'images/logo.png')
 * @returns {string} Full URL ke aset
 */
export const getAssetUrl = (path) => {
    // umhSettings dikirim dari wp_localize_script di file PHP utama
    if (window.umhSettings && window.umhSettings.assetsUrl) {
        // Hapus slash di depan jika ada, agar tidak double slash
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${window.umhSettings.assetsUrl}${cleanPath}`;
    }
    
    // Fallback untuk development lokal (npm start)
    return `/assets/${path}`;
};