import React, { useState } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { LoadingSpinner } from '../components/common/Loading.jsx';
import { Modal } from '../components/common/Modal.jsx';
import UserForm from '../components/forms/UserForm.jsx';
import { Plus, Edit, Trash2, User } from 'lucide-react';

const HR = () => {
    // Menggunakan 'users' sebagai sumber data HR
    const { data, loading, deleteItem } = useApi();
    const staffList = data.users || [];

    const [modalState, setModalState] = useState({ isOpen: false, data: null });

    const handleDelete = async (id) => {
        if (confirm('Hapus akses staff ini?')) {
            try {
                await deleteItem('users', id);
            } catch (e) { alert(e.message); }
        }
    };

    if (loading && staffList.length === 0) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Staff (HR)</h1>
                <button 
                    onClick={() => setModalState({ isOpen: true, data: null })} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2"/> Tambah Staff
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {staffList.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center">
                                    <div className="bg-gray-200 p-2 rounded-full mr-3"><User className="w-4 h-4 text-gray-600"/></div>
                                    <span className="font-medium">{user.full_name || user.display_name}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.user_email || user.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
                                        {user.role?.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => setModalState({ isOpen: true, data: user })} className="text-blue-600"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal 
                title={modalState.data ? 'Edit Staff' : 'Tambah Staff Baru'} 
                isOpen={modalState.isOpen} 
                onClose={() => setModalState({ isOpen: false, data: null })}
            >
                <UserForm 
                    data={modalState.data} 
                    onSuccess={() => setModalState({ isOpen: false, data: null })} 
                />
            </Modal>
        </div>
    );
};

export default HR;