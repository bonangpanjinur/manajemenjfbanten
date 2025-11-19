import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Modal } from '../components/common/Modal';
import { Button, Input, Select } from '../components/common/FormUI';

const HR = () => {
    const { staff, updateStaffRole } = useApi(); // Asumsi user staff di load di context
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const openPermissionModal = (staffMember) => {
        setSelectedStaff(staffMember);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Manajemen Staff (HR)</h2>
            
            <div className="bg-white shadow rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hak Akses</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staff?.map(s => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 font-medium text-gray-900">{s.full_name}</td>
                                <td className="px-6 py-4">
                                    {/* Fix: Warna teks dropdown harus kontras */}
                                    <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-xs">{s.role}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <button onClick={() => openPermissionModal(s)} className="text-blue-600 hover:underline">Atur Hak Akses</button>
                                </td>
                                <td className="px-6 py-4 text-right text-sm">Edit | Hapus</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Pengaturan Hak Akses */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Hak Akses: ${selectedStaff?.full_name}`}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Centang fitur yang dapat diakses oleh staff ini.</p>
                    <div className="grid grid-cols-2 gap-2">
                        {['Dashboard', 'Keuangan', 'Marketing', 'Paket', 'Jemaah', 'HR'].map(feature => (
                            <label key={feature} className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-700">{feature}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setIsModalOpen(false)}>Simpan Akses</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default HR;