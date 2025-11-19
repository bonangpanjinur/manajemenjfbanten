import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Modal } from '../components/common/Modal';
import { Button, Input, Textarea } from '../components/common/FormUI';

const SubAgents = () => {
    const { agents, createAgent } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        name: '', phone: '', email: '',
        province: '', city: '', district: '', village: '',
        address_full: '', join_date: ''
    });

    const handleSubmit = () => {
        createAgent(form);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Sub Agen</h2>
                <Button onClick={() => setIsModalOpen(true)}>Tambah Agen</Button>
            </div>

            {/* Table Listing */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs uppercase font-medium text-gray-500">Nama</th>
                            <th className="px-6 py-3 text-left text-xs uppercase font-medium text-gray-500">Kota</th>
                            <th className="px-6 py-3 text-left text-xs uppercase font-medium text-gray-500">Bergabung</th>
                            <th className="px-6 py-3 text-left text-xs uppercase font-medium text-gray-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agents?.map(agent => (
                            <tr key={agent.id}>
                                <td className="px-6 py-4 font-medium text-gray-900">{agent.name}</td>
                                <td className="px-6 py-4 text-gray-500">{agent.city}, {agent.province}</td>
                                <td className="px-6 py-4 text-gray-500">{agent.join_date}</td>
                                <td className="px-6 py-4 text-blue-600 cursor-pointer">Detail</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Sub Agen">
                <div className="space-y-4">
                    <Input label="Nama Agen" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="No HP" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                        <Input label="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Provinsi" value={form.province} onChange={e => setForm({...form, province: e.target.value})} />
                        <Input label="Kab/Kota" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Kecamatan" value={form.district} onChange={e => setForm({...form, district: e.target.value})} />
                        <Input label="Desa/Kel" value={form.village} onChange={e => setForm({...form, village: e.target.value})} />
                    </div>
                    <Textarea label="Alamat Lengkap" value={form.address_full} onChange={e => setForm({...form, address_full: e.target.value})} />
                    <Input type="date" label="Tanggal Bergabung" value={form.join_date} onChange={e => setForm({...form, join_date: e.target.value})} />
                    
                    <div className="flex justify-end mt-4">
                        <Button onClick={handleSubmit}>Simpan Agen</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SubAgents;