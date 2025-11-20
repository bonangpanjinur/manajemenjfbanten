import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import LeadForm from '../components/forms/LeadForm';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaUserFriends } from 'react-icons/fa';

const Marketing = () => {
    const { apiCall } = useApi();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await apiCall('/leads');
            setLeads(res || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleEdit = (lead) => {
        setEditData(lead);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(!confirm('Hapus data lead ini?')) return;
        await apiCall(`/leads/${id}`, 'DELETE');
        fetchLeads();
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchLeads();
    };

    const getIcon = (source) => {
        switch(source) {
            case 'wa': return <FaWhatsapp className="text-green-500" />;
            case 'ig': return <FaInstagram className="text-pink-500" />;
            case 'fb': return <FaFacebook className="text-blue-600" />;
            case 'tiktok': return <FaTiktok className="text-black" />;
            default: return <FaUserFriends className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'closing': return 'bg-green-100 text-green-800';
            case 'lost': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800'; // new/prospek
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Marketing Leads</h1>
                <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow">
                    + Tambah Lead
                </button>
            </div>

            {loading ? <Loading /> : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sumber</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lead.contact}</td>
                                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 text-sm capitalize">
                                        {getIcon(lead.source)} {lead.source}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(lead)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(lead.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? 'Edit Lead' : 'Tambah Lead Baru'}>
                <LeadForm initialData={editData} onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Marketing;