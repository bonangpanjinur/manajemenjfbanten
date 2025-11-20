// File Location: src/pages/Marketing.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { FaBullhorn, FaPlus, FaWhatsapp } from 'react-icons/fa';
import Modal from '../components/common/Modal';
import LeadForm from '../components/forms/LeadForm';
import Loading from '../components/common/Loading';

const Marketing = () => {
    const { getLeads } = useApi();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getLeads();
            setLeads(Array.isArray(res) ? res : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddNew = () => { setEditingData(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingData(item); setIsModalOpen(true); };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaBullhorn className="text-orange-500" /> Marketing Leads
                </h1>
                <button onClick={handleAddNew} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2 shadow">
                    <FaPlus /> Tambah Prospek
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                {loading ? <Loading /> : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-orange-50 text-orange-800">
                            <tr>
                                <th className="p-4">Nama Prospek</th>
                                <th className="p-4">No. HP</th>
                                <th className="p-4">Sumber</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{lead.name}</td>
                                    <td className="p-4 text-gray-600">{lead.phone}</td>
                                    <td className="p-4 text-gray-500 capitalize">{lead.source}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded font-bold uppercase 
                                            ${lead.status === 'hot' ? 'bg-red-100 text-red-600' : 
                                            lead.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-700 text-xl">
                                            <FaWhatsapp />
                                        </a>
                                        <button onClick={() => handleEdit(lead)} className="text-blue-500 hover:underline text-sm">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {leads.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-400">Belum ada leads masuk.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingData ? 'Edit Lead' : 'Tambah Lead Baru'}>
                <LeadForm data={editingData} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Marketing;