import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Modal from '../components/common/Modal';
import LeadForm from '../components/forms/LeadForm'; // Pastikan file ini ada atau buat sederhana

const Marketing = () => {
    const { getLeads } = useApi();
    const [leads, setLeads] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = () => {
        getLeads().then(res => setLeads(res || [])).catch(console.error);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Marketing Leads</h1>
                <button 
                    onClick={() => setIsModalOpen(true)} // Perbaikan: Trigger modal
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Tambah Lead
                </button>
            </div>

            {/* Table Listing Leads */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {leads.map(lead => (
                            <tr key={lead.id}>
                                <td className="px-6 py-4">{lead.name}</td>
                                <td className="px-6 py-4">{lead.phone}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${lead.status === 'new' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                        {lead.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Lead Baru">
                <LeadForm onSuccess={() => {
                    setIsModalOpen(false);
                    fetchLeads();
                }} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Marketing;