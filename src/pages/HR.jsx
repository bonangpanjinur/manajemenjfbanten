// File Location: src/pages/HR.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Modal from '../components/common/Modal';
import UserForm from '../components/forms/UserForm';
import { FaUserPlus } from 'react-icons/fa';

const HR = () => {
    const { getEmployees } = useApi();
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = () => getEmployees().then(res => setEmployees(res||[]));
    useEffect(() => { fetchData(); }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Data Pegawai</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 shadow">
                    <FaUserPlus /> Tambah Karyawan
                </button>
            </div>

            <div className="bg-white shadow rounded overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr><th className="p-4">Nama</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">HP</th></tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{emp.full_name || emp.display_name}</td>
                                <td className="p-4 text-gray-600">{emp.email}</td>
                                <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs uppercase">{emp.role}</span></td>
                                <td className="p-4">{emp.phone || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Karyawan">
                <UserForm onSuccess={() => { setIsModalOpen(false); fetchData(); }} />
            </Modal>
        </div>
    );
};

export default HR;