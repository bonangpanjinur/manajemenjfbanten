import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import { Plus, Trash2, ChevronRight } from 'lucide-react';

const MasterData = () => {
  const { api } = useApi();
  const [activeTab, setActiveTab] = useState('hotels'); 
  const [dataList, setDataList] = useState([]);
  const [categories, setCategories] = useState([]); // Khusus untuk dropdown parent category
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'categories' ? '/categories' : `/${activeTab}`;
      const res = await api.get(endpoint);
      
      if (activeTab === 'categories') {
          setCategories(res.data || []); // Simpan untuk dropdown parent
          setDataList(res.data || []);
      } else {
          setDataList(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const endpoint = activeTab === 'categories' ? '/categories' : `/${activeTab}`;
        await api.post(endpoint, formData);
        setIsModalOpen(false);
        setFormData({});
        fetchData();
    } catch(e) { alert("Gagal menyimpan"); }
  }

  const handleDelete = async (id) => {
      if(!confirm("Hapus data ini?")) return;
      try {
          // Gunakan endpoint spesifik per tipe jika api global delete belum ada
          const endpoint = activeTab === 'categories' ? `/categories/${id}` : `/master/${activeTab}/${id}`;
          await api.delete(endpoint);
          fetchData();
      } catch(e) { alert("Gagal hapus"); }
  }

  // Helper: Render Kategori dengan Indentasi Sub-Kategori
  const renderCategories = () => {
      // Pisahkan parent dan child
      const parents = dataList.filter(c => c.parent_id == 0 || c.parent_id == null);
      
      return parents.map(parent => {
          const children = dataList.filter(c => c.parent_id == parent.id);
          return (
              <React.Fragment key={parent.id}>
                  <tr className="bg-gray-50 font-bold">
                      <td className="p-4">{parent.name}</td>
                      <td className="p-4 text-gray-500">Parent Category</td>
                      <td className="p-4 text-right"><button onClick={() => handleDelete(parent.id)}><Trash2 size={16} className="text-red-500"/></button></td>
                  </tr>
                  {children.map(child => (
                      <tr key={child.id} className="bg-white">
                          <td className="p-4 pl-8 flex items-center gap-2"><ChevronRight size={14} className="text-gray-400"/> {child.name}</td>
                          <td className="p-4 text-gray-400 text-sm">Sub dari {parent.name}</td>
                          <td className="p-4 text-right"><button onClick={() => handleDelete(child.id)}><Trash2 size={16} className="text-red-400"/></button></td>
                      </tr>
                  ))}
              </React.Fragment>
          )
      });
  };

  return (
    <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Master Data</h1>
        <div className="flex space-x-4 border-b">
            {['hotels', 'airlines', 'categories'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-4 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                    {tab}
                </button>
            ))}
        </div>

        <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
            + Tambah Data
        </button>

        <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="p-4">Nama</th>
                        <th className="p-4">Detail</th>
                        <th className="p-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {activeTab === 'categories' ? renderCategories() : dataList.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{item.name}</td>
                            <td className="p-4 text-sm text-gray-500">
                                {activeTab === 'hotels' && `${item.city} (${item.star_rating} Bintang)`}
                                {activeTab === 'airlines' && `Kode: ${item.code}`}
                            </td>
                            <td className="p-4 text-right">
                                <button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="font-bold text-lg mb-4 capitalize">Tambah {activeTab}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input required placeholder="Nama" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, name: e.target.value})} />
                        
                        {activeTab === 'hotels' && (
                            <>
                                <input placeholder="Kota" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, city: e.target.value})} />
                                <input type="number" placeholder="Bintang (1-5)" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, star_rating: e.target.value})} />
                            </>
                        )}

                        {activeTab === 'airlines' && (
                            <input placeholder="Kode Maskapai" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, code: e.target.value})} />
                        )}

                        {/* Sub Category Logic */}
                        {activeTab === 'categories' && (
                            <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, parent_id: e.target.value})}>
                                <option value="0">-- Sebagai Kategori Utama --</option>
                                {categories.filter(c => c.parent_id == 0).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default MasterData;