import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import SubAgentForm from '../components/forms/SubAgentForm';
import { Edit, Trash2, UserPlus } from 'lucide-react';

const SubAgents = () => {
    const { api } = useApi();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sub-agents');
            setAgents(res.data || []);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAgents(); }, []);

    const handleDelete = async (id) => {
        if(!confirm("Hapus agen ini?")) return;
        await api.delete(`/sub-agents/${id}`);
        fetchAgents();
    }

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchAgents();
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Data Sub Agent</h1>
                <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex gap-2 items-center">
                   <UserPlus size={18}/> Tambah Agent
                </button>
            </div>

            {loading ? <Loading /> : (
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b uppercase text-gray-500">
                            <tr>
                                <th className="p-4">Nama</th>
                                <th className="p-4">Kontak</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {agents.map(a => (
                                <tr key={a.id}>
                                    <td className="p-4 font-medium">{a.name}</td>
                                    <td className="p-4">{a.phone} <br/><span className="text-xs text-gray-400">{a.email}</span></td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{a.status}</span></td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button onClick={() => { setEditData(a); setIsModalOpen(true); }} className="text-blue-600"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(a.id)} className="text-red-600"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? "Edit Agent" : "Tambah Agent"}>
                <SubAgentForm initialData={editData} closeModal={() => setIsModalOpen(false)} onSuccess={handleSuccess} /> {/* Pass onSuccess props fix */}
            </Modal>
        </div>
    );
};
export default SubAgents;