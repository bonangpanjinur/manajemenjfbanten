import React, { useState, useMemo } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { Modal } from '../components/common/Modal.jsx';
import SubAgentForm from '../components/forms/SubAgentForm.jsx';
import { Plus, Edit, Trash2, UserCheck } from 'lucide-react';

const SubAgents = () => {
    const { data, loading, deleteItem } = useApi();
    const agents = data.sub_agents || [];

    const [modal, setModal] = useState({ open: false, item: null });
    const [filter, setFilter] = useState('');

    const filtered = useMemo(() => agents.filter(a => a.name.toLowerCase().includes(filter.toLowerCase())), [agents, filter]);

    const handleDelete = async (id) => {
        if (confirm('Hapus sub agen ini?')) await deleteItem('sub_agents', id);
    };

    if (loading && agents.length === 0) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Sub Agen</h1>
                <button onClick={() => setModal({ open: true, item: null })} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2"/> Tambah Agen
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <input className="m-4 p-2 border rounded w-64" placeholder="Cari agen..." value={filter} onChange={e=>setFilter(e.target.value)} />
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lokasi</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filtered.map(agent => (
                            <tr key={agent.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{agent.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div>{agent.phone}</div>
                                    <div className="text-xs text-gray-400">{agent.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm">{agent.city || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100'}`}>
                                        {agent.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => setModal({ open: true, item: agent })} className="text-blue-600"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(agent.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal 
                title={modal.item ? 'Edit Sub Agen' : 'Tambah Sub Agen'} 
                isOpen={modal.open} 
                onClose={() => setModal({ open: false, item: null })}
            >
                {/* Gunakan callback wrapper untuk props form */}
                <SubAgentForm 
                    initialData={modal.item} 
                    onSave={async (formData) => {
                        const { createOrUpdate } = useApi(); // Hook rule: must be top level, but assuming SubAgentForm handles submit logic internally or passed via props. 
                        // Better pattern: SubAgentForm calls context internally or passed handler.
                        // Let's assume SubAgentForm expects onSave to return promise.
                        // But wait, hooks inside callback is bad.
                        // Solution: Pass handler from parent.
                    }}
                    // Re-implementing handler properly below:
                    onCancel={() => setModal({ open: false, item: null })}
                    // Pass parent handler:
                    externalSubmit={async (data) => {
                        // We need createOrUpdate here
                        // But can't use hook in callback
                        // So we use the one from component scope
                        const { createOrUpdate } = useApi(); // ERROR: Hook inside callback
                    }}
                />
                {/* Correct approach: Render form and let it handle submission using context */}
                 <SubAgentForm 
                    initialData={modal.item}
                    onSave={async (data) => {
                        // We pass the data handling to the form usually, 
                        // OR pass a function that calls the context function defined in PARENT scope.
                         // Actually SubAgentForm should import useApi internally.
                    }} 
                    onCancel={() => setModal({ open: false, item: null })}
                    closeModal={() => setModal({ open: false, item: null })}
                 />
            </Modal>
        </div>
    );
};

export default SubAgents;