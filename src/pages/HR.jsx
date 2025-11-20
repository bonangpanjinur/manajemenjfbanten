import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal'; // PERBAIKAN: Import Default (Tanpa Kurung Kurawal)
import Loading from '../components/common/Loading';
import UserForm from '../components/forms/UserForm'; // Pastikan path ini benar
import { FaUserPlus, FaEdit, FaTrash, FaUserTie } from 'react-icons/fa';

const HR = () => {
    const { getEmployees, createOrUpdate, apiCall, loading } = useApi();
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [localLoading, setLocalLoading] = useState(true); // Loading state lokal halaman ini

    // Fetch Data Pegawai
    const fetchData = async () => {
        setLocalLoading(true);
        try {
            // Kita gunakan getEmployees dari context, atau fallback ke manual fetch jika belum ada
            const res = await getEmployees ? getEmployees() : apiCall('/hr/employees');
            setEmployees(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            console.error("Gagal memuat data HR:", error);
        } finally {
            setLocalLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (emp) => {
        setSelectedEmployee(emp);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
            try {
                await apiCall(`/users/${id}`, 'DELETE');
                fetchData(); // Refresh data
            } catch (error) {
                alert('Gagal menghapus: ' + error.message);
            }
        }
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        fetchData();
    };

    if (localLoading && employees.length === 0) return <Loading text="Memuat Data Pegawai..." />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen HR & Staff</h1>
                    <p className="text-sm text-gray-500">Kelola data pengguna dan hak akses sistem.</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
                >
                    <FaUserPlus /> Tambah Pegawai
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4 border-b">Nama Lengkap</th>
                                <th className="p-4 border-b">Email / Username</th>
                                <th className="p-4 border-b">Role / Jabatan</th>
                                <th className="p-4 border-b">Status</th>
                                <th className="p-4 border-b text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employees.length > 0 ? (
                                employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FaUserTie />
                                            </div>
                                            {emp.display_name || emp.user_login}
                                        </td>
                                        <td className="p-4 text-gray-600">{emp.user_email}</td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs uppercase font-bold border border-gray-200">
                                                {(emp.roles && emp.roles[0]) ? emp.roles[0].replace('_', ' ') : 'User'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                                                Aktif
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(emp)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                    title="Hapus"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        Belum ada data pegawai. Silakan tambah baru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedEmployee ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
                size="lg"
            >
                <UserForm 
                    initialData={selectedEmployee}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default HR;