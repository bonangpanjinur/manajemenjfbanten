import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Input, Select } from '../components/common/FormUI';

const Marketing = () => {
    const { leads } = useApi();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredLeads = leads?.filter(lead => {
        const matchName = lead.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchName && matchStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Marketing Leads</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Tambah Lead</button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow flex gap-4">
                <Input 
                    placeholder="Cari nama..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="max-w-xs text-gray-800 bg-white border-gray-300" // Fix UI
                />
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border-gray-300 rounded-md text-gray-800 bg-white focus:ring-blue-500 focus:border-blue-500 p-2"
                >
                    <option value="all">Semua Status</option>
                    <option value="new">Baru</option>
                    <option value="contacted">Dihubungi</option>
                    <option value="closing">Closing</option>
                    <option value="lost">Lost</option>
                </select>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads?.map(lead => (
                            <tr key={lead.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{lead.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{lead.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${lead.status === 'closing' ? 'bg-green-100 text-green-800' : 
                                          lead.status === 'lost' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-blue-600 cursor-pointer">Edit</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Marketing;