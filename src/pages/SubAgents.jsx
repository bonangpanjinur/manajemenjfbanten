import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import SubAgentForm from '../components/forms/SubAgentForm';

const SubAgents = () => {
    const { apiCall } = useApi();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const res = await apiCall('/sub-agents');
            setAgents(res || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAgents(); }, []);

    const handleDelete = async (id) => {
        if(!confirm('Hapus sub agent ini?')) return;
        await apiCall(`/sub-agents/${id}`, 'DELETE');
        fetchAgents();
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchAgents();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Sub Agent</h1>
                <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow">
                    + Tambah Sub Agent
                </button>
            </div>

            {loading ? <Loading /> : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Kontak</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Lokasi</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-500">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {agents.map(agent => (
                                <tr key={agent.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{agent.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>{agent.phone}</div>
                                        <div className="text-xs text-gray-400">{agent.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {agent.address_details?.city || '-'}, {agent.address_details?.province || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {agent.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => { setEditData(agent); setIsModalOpen(true); }} className="text-indigo-600 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(agent.id)} className="text-red-600">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? 'Edit Sub Agent' : 'Tambah Sub Agent'}>
                <SubAgentForm initialData={editData} onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};
export default SubAgents;