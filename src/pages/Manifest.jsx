import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';

// Icons (Menggunakan SVG manual agar tidak perlu install lucide-react jika belum ada)
const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const Manifest = () => {
    const { api } = useApi();
    const [packages, setPackages] = useState([]);
    const [selectedPkg, setSelectedPkg] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load list paket saat halaman dibuka
    useEffect(() => {
        api.get('/packages?status=active').then(res => setPackages(res || [])).catch(console.error);
    }, []);

    // Ambil data manifest ketika paket dipilih
    const fetchManifest = async (pkgId) => {
        if(!pkgId) return;
        setLoading(true);
        try {
            const res = await api.get(`/manifest/${pkgId}`);
            setData(res);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    const exportCSV = () => {
        if(!data || !data.manifest) return;
        const rows = [
            ['No', 'Nama Lengkap', 'Gender', 'No Paspor', 'NIK', 'Mahram', 'Hubungan', 'Hotel', 'No Kamar'],
            ...data.manifest.map((j, i) => [
                i + 1,
                j.full_name,
                j.gender,
                j.passport_number || '-',
                "'" + (j.nik || '-'), // Quote force string excel
                j.mahram_name || '-',
                j.relation || '-',
                j.hotel_name || '-',
                j.room_number ? `${j.room_number} (${j.room_type})` : '-'
            ])
        ];

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `manifest_paket_${selectedPkg}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="p-6 space-y-6 min-h-screen bg-gray-50">
            {/* Header & Filter (Disembunyikan saat Print) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                         Manifest Keberangkatan
                    </h1>
                    <p className="text-sm text-gray-500">Daftar penumpang, mahram, dan rooming list.</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        className="border rounded p-2 bg-white shadow-sm" 
                        value={selectedPkg} 
                        onChange={e => { setSelectedPkg(e.target.value); fetchManifest(e.target.value); }}
                    >
                        <option value="">-- Pilih Paket Keberangkatan --</option>
                        {packages.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({new Date(p.departure_date).toLocaleDateString('id-ID')})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading ? <Loading text="Mengambil data manifest..." /> : data ? (
                <div className="bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:w-full">
                    
                    {/* Header Dokumen (Tampil Bagus saat Print) */}
                    <div className="p-6 border-b bg-blue-50 print:bg-white print:border-b-2 print:border-black">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800 print:text-black">{data.package.name}</h2>
                                <div className="text-gray-600 print:text-black mt-1 text-sm">
                                    <span className="mr-4">✈️ {data.package.airline_name || 'Belum set maskapai'}</span>
                                    <span>📅 {new Date(data.package.departure_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="text-right text-sm print:text-xs">
                                <p>Total: <strong className="text-lg">{data.stats.total}</strong> Pax</p>
                                <p className="text-gray-500 print:text-black">L: {data.stats.pria} | P: {data.stats.wanita}</p>
                            </div>
                        </div>

                        {/* Tombol Aksi (Hidden saat print) */}
                        <div className="mt-4 flex gap-2 print:hidden">
                            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-black transition">
                                <PrintIcon /> Cetak Manifest
                            </button>
                            <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                                <DownloadIcon /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Table Manifest */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold print:bg-gray-200 print:text-black">
                                <tr>
                                    <th className="px-4 py-3 w-10 border-b">No</th>
                                    <th className="px-4 py-3 border-b">Nama Jamaah</th>
                                    <th className="px-4 py-3 w-16 border-b">L/P</th>
                                    <th className="px-4 py-3 border-b">No. Paspor</th>
                                    <th className="px-4 py-3 border-b">Mahram / Keluarga</th>
                                    <th className="px-4 py-3 border-b">Hotel & Kamar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.manifest.length === 0 && (
                                    <tr><td colSpan="6" className="p-6 text-center text-gray-400">Belum ada jamaah terdaftar di paket ini.</td></tr>
                                )}
                                {data.manifest.map((j, i) => (
                                    <tr key={j.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                                        <td className="px-4 py-2 border-b print:border-gray-300">{i + 1}</td>
                                        <td className="px-4 py-2 font-medium border-b print:border-gray-300">
                                            {j.full_name}
                                            <div className="text-xs text-gray-400 print:hidden">NIK: {j.nik}</div>
                                        </td>
                                        <td className="px-4 py-2 border-b print:border-gray-300">{j.gender}</td>
                                        <td className="px-4 py-2 font-mono border-b print:border-gray-300">{j.passport_number || '-'}</td>
                                        <td className="px-4 py-2 text-gray-600 border-b print:border-gray-300">
                                            {j.mahram_name ? (
                                                <span>{j.mahram_name} <span className="text-xs bg-gray-100 px-1 rounded border print:border-black print:bg-transparent">({j.relation})</span></span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-2 border-b print:border-gray-300">
                                            {j.room_number ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-blue-600 print:text-black">Kamar {j.room_number}</span>
                                                    <span className="text-xs text-gray-500 print:text-black">{j.hotel_name} ({j.room_type})</span>
                                                </div>
                                            ) : <span className="text-red-400 text-xs italic print:text-gray-400">Belum plotting</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Footer Statistik Print Only */}
                    <div className="hidden print:block mt-6 pt-4 border-t text-sm">
                        <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
                        <p>Oleh sistem Manajemen Travel Umroh</p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 bg-white">
                    <p className="text-lg">Silakan pilih paket di atas untuk melihat manifest.</p>
                </div>
            )}
        </div>
    );
};

export default Manifest;