import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import JamaahForm from '../components/forms/JamaahForm';
import JamaahPaymentsModal from '../components/modals/JamaahPaymentsModal';

export default function Jamaah() {
    const { api } = useApi();
    const [jamaahList, setJamaahList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJamaah, setEditingJamaah] = useState(null);
    const [search, setSearch] = useState('');
    
    // State untuk Modal Pembayaran
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedJamaahForPayment, setSelectedJamaahForPayment] = useState(null);

    const fetchJamaah = async () => {
        try {
            setLoading(true);
            // Kirim parameter search jika ada
            const endpoint = search ? `/jamaah?search=${search}` : '/jamaah';
            const data = await api.get(endpoint);
            setJamaahList(data);
        } catch (error) {
            console.error('Failed to fetch jamaah', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search agar tidak request setiap ketik
        const timeoutId = setTimeout(() => {
            fetchJamaah();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data jamaah ini? Data keuangan terkait mungkin akan diarsipkan.')) {
            try {
                await api.delete(`/jamaah/${id}`);
                fetchJamaah();
            } catch (error) {
                console.error('Failed to delete', error);
                alert('Gagal menghapus data');
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingJamaah) {
                await api.put(`/jamaah/${editingJamaah.id}`, formData);
            } else {
                await api.post('/jamaah', formData);
            }
            setIsModalOpen(false);
            setEditingJamaah(null);
            fetchJamaah();
        } catch (error) {
            console.error('Failed to save', error);
            alert('Gagal menyimpan data');
        }
    };

    const openPaymentModal = (jamaah) => {
        setSelectedJamaahForPayment(jamaah);
        setPaymentModalOpen(true);
    };

    // --- FITUR BARU: WHATSAPP GENERATOR ---
    const handleWhatsApp = (jamaah) => {
        if (!jamaah.phone_number) {
            alert('Nomor telepon tidak tersedia');
            return;
        }

        // Format nomor HP (ganti 08 jadi 628)
        let phone = jamaah.phone_number.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }

        // Template Pesan Cerdas
        let message = '';
        const salam = `Assalamu'alaikum Bpk/Ibu ${jamaah.full_name}, `;
        
        if (jamaah.payment_status === 'lunas') {
            message = `${salam} terima kasih telah melunasi pembayaran Umrah. Berikut kami lampirkan info persiapan keberangkatan...`;
        } else {
            // Hitung sisa tagihan (simulasi, idealnya dari DB)
            const paid = parseFloat(jamaah.amount_paid || 0);
            const total = parseFloat(jamaah.total_price || 30000000); // Default/Fallback price
            const sisa = total - paid;
            
            message = `${salam} mohon informasinya untuk pelunasan sisa pembayaran sebesar Rp ${sisa.toLocaleString('id-ID')}. Terima kasih.`;
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loading && !search) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Data Jamaah</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <input 
                        type="text"
                        placeholder="Cari nama / paspor..."
                        className="border rounded-lg px-4 py-2 w-full md:w-64 focus:ring-blue-500 focus:border-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button 
                        onClick={() => { setEditingJamaah(null); setIsModalOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                    >
                        + Jamaah Baru
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Bayar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Data</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {jamaahList.map((jamaah) => (
                            <tr key={jamaah.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{jamaah.full_name}</div>
                                    <div className="text-sm text-gray-500">{jamaah.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                    <div className="text-xs text-gray-400 mt-1">{jamaah.phone_number || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{jamaah.passport_number || 'Belum ada paspor'}</div>
                                    <div className="text-xs text-gray-500">NIK: {jamaah.nik || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        jamaah.payment_status === 'lunas' ? 'bg-green-100 text-green-800' : 
                                        jamaah.payment_status === 'cicil' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {jamaah.payment_status ? jamaah.payment_status.toUpperCase() : 'PENDING'}
                                    </span>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Paid: Rp {parseInt(jamaah.amount_paid || 0).toLocaleString('id-ID')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {jamaah.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        {/* Tombol WhatsApp */}
                                        <button 
                                            onClick={() => handleWhatsApp(jamaah)}
                                            className="text-green-600 hover:text-green-900 border border-green-200 p-1 rounded hover:bg-green-50"
                                            title="Hubungi via WhatsApp"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                        </button>
                                        
                                        {/* Tombol Bayar */}
                                        <button 
                                            onClick={() => openPaymentModal(jamaah)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Catat Pembayaran"
                                        >
                                            Bayar
                                        </button>
                                        
                                        {/* Tombol Edit */}
                                        <button 
                                            onClick={() => { setEditingJamaah(jamaah); setIsModalOpen(true); }}
                                            className="text-indigo-600 hover:text-indigo-900"
                                            title="Edit Data"
                                        >
                                            Edit
                                        </button>
                                        
                                        {/* Tombol Hapus */}
                                        <button 
                                            onClick={() => handleDelete(jamaah.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Hapus Data"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {jamaahList.length === 0 && (
                    <div className="p-6 text-center text-gray-500">Belum ada data jamaah.</div>
                )}
            </div>

            {/* Modal Form Jamaah */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={editingJamaah ? "Edit Data Jamaah" : "Registrasi Jamaah Baru"}
                maxWidth="4xl"
            >
                <JamaahForm 
                    initialData={editingJamaah}
                    onSubmit={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* Modal Pembayaran */}
            <JamaahPaymentsModal 
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                jamaah={selectedJamaahForPayment}
                onSuccess={() => {
                    setPaymentModalOpen(false);
                    fetchJamaah(); // Refresh data setelah bayar
                }}
            />
        </div>
    );
}