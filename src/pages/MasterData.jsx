import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { Button, Input } from '../components/common/FormUI';
import { Trash2 } from 'lucide-react';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('airlines');
    const { masterData, fetchMasterData, createMasterItem, deleteMasterItem } = useApi();

    useEffect(() => {
        fetchMasterData();
    }, []);

    const [newItem, setNewItem] = useState({ name: '', info: '' });

    const handleAdd = () => {
        const endpoint = activeTab === 'airlines' ? 'airlines' : 'hotels';
        const payload = activeTab === 'airlines' 
            ? { name: newItem.name, logo_url: newItem.info } 
            : { name: newItem.name, city: newItem.info };
            
        createMasterItem(endpoint, payload).then(() => {
            setNewItem({ name: '', info: '' });
            fetchMasterData();
        });
    };

    const handleDelete = (id) => {
        const endpoint = activeTab === 'airlines' ? 'airlines' : 'hotels';
        if(confirm('Hapus data ini?')) deleteMasterItem(endpoint, id).then(fetchMasterData);
    };

    const list = activeTab === 'airlines' ? masterData?.airlines : masterData?.hotels;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Data Master</h2>
            <div className="flex border-b">
                <button onClick={() => setActiveTab('airlines')} className={`px-4 py-2 ${activeTab === 'airlines' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>Maskapai</button>
                <button onClick={() => setActiveTab('hotels')} className={`px-4 py-2 ${activeTab === 'hotels' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>Hotel</button>
            </div>

            <div className="bg-white p-4 rounded shadow flex gap-4 items-end">
                <div className="flex-1">
                    <Input label={activeTab === 'airlines' ? 'Nama Maskapai' : 'Nama Hotel'} value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                </div>
                <div className="flex-1">
                    <Input 
                        label={activeTab === 'airlines' ? 'URL Logo' : 'Kota'} 
                        value={newItem.info} 
                        onChange={e => setNewItem({...newItem, info: e.target.value})} 
                    />
                </div>
                <Button onClick={handleAdd}>Tambah</Button>
            </div>

            <div className="bg-white shadow rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{activeTab === 'airlines' ? 'Logo' : 'Kota'}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {list?.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 font-medium">{item.name}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {activeTab === 'airlines' && item.logo_url ? <img src={item.logo_url} alt="logo" className="h-8" /> : item.city || item.logo_url}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end">
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MasterData;