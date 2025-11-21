import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import LeadForm from '../components/forms/LeadForm'; // Pastikan path benar
import { Trash2, Edit, UserPlus } from 'lucide-react';

const Marketing = () => {
    const { api } = useApi(); // Gunakan 'api' generic object
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leads');
            setLeads(res.data || []);
        } catch (error) {
            console.error("Gagal load leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeads(); }, []);

    const handleDelete = async (id) => {
        if(!confirm('Hapus data prospek ini?')) return;
        try {
            // Sesuaikan endpoint delete di api-marketing.php jika perlu (biasanya POST dengan action delete atau method DELETE)
            // Disini kita asumsikan endpoint DELETE standar
            // Jika api-marketing.php belum support DELETE, Anda harus menambahkannya di PHP
            // Untuk sementara kita gunakan method DELETE standar REST
             await api.delete(`/leads?id=${id}`); // Atau sesuaikan endpointnya
             fetchLeads();
        } catch(e) {
            alert("Gagal menghapus (Pastikan API support DELETE)");
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchLeads();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Marketing Leads</h1>
                <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                    <UserPlus size={18}/> Tambah Lead
                </button>
            </div>

            {loading ? <Loading /> : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b uppercase text-gray-500">
                            <tr>
                                <th className="p-4">Nama</th>
                                <th className="p-4">Kontak</th>
                                <th className="p-4">Sumber</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{lead.name}</td>
                                    <td className="p-4">{lead.contact}</td>
                                    <td className="p-4 capitalize">{lead.source}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${lead.status === 'closing' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button onClick={() => { setEditData(lead); setIsModalOpen(true); }} className="text-blue-600"><Edit size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? 'Edit Lead' : 'Input Lead Baru'}>
                <LeadForm initialData={editData} onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Marketing;