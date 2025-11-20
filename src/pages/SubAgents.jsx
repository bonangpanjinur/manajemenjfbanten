import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Modal from '../components/common/Modal'; // PERBAIKAN: Import Default
import Loading from '../components/common/Loading';
import SubAgentForm from '../components/forms/SubAgentForm'; // Pastikan path ini benar
import { FaUserTie, FaEdit, FaTrash, FaWhatsapp } from 'react-icons/fa';

const SubAgents = () => {
    const { getSubAgents, apiCall } = useApi();
    const [agents, setAgents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAgents = async () => {
        setIsLoading(true);
        try {
            // Menggunakan helper getSubAgents atau langsung apiCall jika helper belum ready
            const res = await (getSubAgents ? getSubAgents() : apiCall('/sub-agents'));
            setAgents(Array.isArray(res) ? res : (res.data || []));
        } catch (err) {
            console.error("Gagal memuat data agen:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleCreate = () => {
        setSelectedAgent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (agent) => {
        setSelectedAgent(agent);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus data agen ini?')) {
            try {
                await apiCall(`/sub-agents/${id}`, 'DELETE');
                fetchAgents();
            } catch (err) {
                alert('Gagal menghapus: ' + err.message);
            }
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchAgents();
    };

    if (isLoading) return <Loading text="Memuat Data Agen..." />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Sub-Agen</h1>
                    <p className="text-sm text-gray-500">Kelola mitra dan perwakilan agen travel.</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
                >
                    <FaUserTie /> Tambah Agen
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.length > 0 ? (
                    agents.map((agent) => (
                        <div key={agent.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                                        {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{agent.name}</h3>
                                        <p className="text-xs text-gray-500">{agent.city || 'Kota Tidak Diketahui'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(agent)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(agent.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Jamaah:</span>
                                    <span className="font-medium">{agent.jamaah_count || 0} Orang</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Komisi:</span>
                                    <span className="font-medium text-green-600">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(agent.commission || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-50 flex gap-2">
                                <a 
                                    href={`https://wa.me/${agent.phone}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-center text-sm font-medium hover:bg-green-100 flex items-center justify-center gap-2 transition"
                                >
                                    <FaWhatsapp /> Hubungi
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="text-gray-400 text-4xl mb-3">👥</div>
                        <p className="text-gray-500 font-medium">Belum ada data sub-agen.</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedAgent ? "Edit Sub Agen" : "Tambah Sub Agen Baru"}
                size="md"
            >
                <SubAgentForm 
                    initialData={selectedAgent}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default SubAgents;