import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import StatCard from '../components/common/StatCard';
import EmployeeForm from '../components/forms/EmployeeForm'; // Import form baru

export default function HR() {
    const { api } = useApi();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await api.get('/hr/employees');
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await api.put(`/hr/employees/${editingItem.id}`, formData);
            } else {
                await api.post('/hr/employees', formData);
            }
            setIsModalOpen(false);
            setEditingItem(null);
            fetchEmployees();
        } catch (error) {
            console.error('Failed to save employee', error);
            alert('Gagal menyimpan data karyawan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus data karyawan ini?')) {
            try {
                await api.delete(`/hr/employees/${id}`);
                fetchEmployees();
            } catch (error) {
                console.error('Failed to delete', error);
            }
        }
    };

    // Helper untuk menampilkan badge akses
    const renderAccessBadges = (permissions) => {
        if (!permissions || permissions.length === 0) return <span className="text-gray-400 text-xs">Tidak ada akses</span>;
        // Tampilkan maks 3, sisanya +X
        const display = permissions.slice(0, 3);
        const remaining = permissions.length - 3;
        return (
            <div className="flex flex-wrap gap-1">
                {display.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                        {p}
                    </span>
                ))}
                {remaining > 0 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{remaining}
                    </span>
                )}
            </div>
        );
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen SDM (HR)</h1>
                <button 
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                    + Tambah Karyawan
                </button>
            </div>

            {/* Stats Ringkas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Karyawan" value={employees.length} color="blue" />
                <StatCard title="Karyawan Aktif" value={employees.filter(e => e.status === 'active').length} color="green" />
                <StatCard title="Total Gaji (Est)" value={`Rp ${employees.reduce((acc, curr) => acc + parseFloat(curr.salary || 0), 0).toLocaleString()}`} color="yellow" />
            </div>

            {/* Table List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama / Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hak Akses</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                    <div className="text-sm text-gray-500">{emp.email}</div>
                                    <div className="text-sm text-gray-500">{emp.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {emp.position}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                    {renderAccessBadges(emp.access_permissions)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {emp.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => { setEditingItem(emp); setIsModalOpen(true); }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(emp.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {employees.length === 0 && (
                    <div className="p-6 text-center text-gray-500">Belum ada data karyawan.</div>
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={editingItem ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
                maxWidth="2xl" // Modal agak lebar untuk checkbox permissions
            >
                <EmployeeForm 
                    initialData={editingItem}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>
        </div>
    );
}