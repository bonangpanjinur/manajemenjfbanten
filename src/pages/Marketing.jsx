import React, { useState, useMemo } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { Modal } from '../components/common/Modal.jsx';
import LeadForm from '../components/forms/LeadForm.jsx';
import { Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';

const Marketing = () => {
    const { data, loading, deleteItem } = useApi();
    const leads = data.marketing || [];

    const [isOpen, setIsOpen] = useState(false); // State eksplisit untuk modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('');

    // Handler untuk membuka modal
    const openModal = (item = null) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setIsOpen(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Hapus lead ini?')) {
            await deleteItem('marketing', id);
        }
    };

    const filteredData = useMemo(() => 
        leads.filter(l => l.name.toLowerCase().includes(filter.toLowerCase())), 
    [leads, filter]);

    if (loading && leads.length === 0) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Marketing Leads</h1>
                <button 
                    onClick={() => openModal()} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2"/> Tambah Lead
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <input className="m-4 p-2 border rounded w-64" placeholder="Cari lead..." value={filter} onChange={e=>setFilter(e.target.value)} />
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex items-center"><Phone className="w-3 h-3 mr-1"/> {item.phone}</div>
                                    <div className="flex items-center mt-1"><Mail className="w-3 h-3 mr-1"/> {item.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => openModal(item)} className="text-blue-600"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal 
                title={selectedItem ? 'Edit Lead' : 'Tambah Lead'} 
                isOpen={isOpen} 
                onClose={closeModal}
            >
                <LeadForm data={selectedItem} onClose={closeModal} />
            </Modal>
        </div>
    );
};

export default Marketing;