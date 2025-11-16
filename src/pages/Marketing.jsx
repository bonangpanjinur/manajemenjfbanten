import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import LeadForm from '../components/forms/LeadForm';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Button } from '../components/common/FormUI';
import { getStatusBadge } from '../utils/helpers';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const MarketingComponent = () => {
    const { leads, users, saveLead, deleteLead, loading, error } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const handleOpenModal = (lead = null) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLead(null);
    };

    const handleSave = async (lead) => {
        try {
            await saveLead(lead);
            handleCloseModal();
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm && window.confirm('Yakin ingin menghapus lead ini?')) {
            try {
                await deleteLead(id);
            } catch (e) {
                alert(`Error: ${e.message}`);
            }
        }
    };
    
    const getUserName = (userId) => {
        const user = users.find(u => u.id == userId);
        return user ? user.full_name : 'N/A';
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 relative min-h-[300px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Manajemen Leads</h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Tambah Lead
                </Button>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && <LoadingSpinner />}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ditugaskan ke</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Tidak ada data leads.</td>
                                </tr>
                            )}
                            {leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div>{lead.phone}</div>
                                        <div>{lead.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lead.source}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(lead.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getUserName(lead.assigned_to_user_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                        <Button variant="icon" size="sm" onClick={() => handleOpenModal(lead)} title="Edit Lead">
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="icon" size="sm" className="text-red-600 hover:bg-red-100" onClick={() => handleDelete(lead.id)} title="Hapus Lead">
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                title={selectedLead ? 'Edit Lead' : 'Tambah Lead Baru'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                size="3xl"
            >
                <LeadForm
                    initialData={selectedLead}
                    onSubmit={handleSave}
                    onCancel={handleCloseModal}
                    users={users}
                />
            </Modal>
        </div>
    );
};

export default MarketingComponent;