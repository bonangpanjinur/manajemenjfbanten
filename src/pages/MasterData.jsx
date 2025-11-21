import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import { Plus, Building, Plane, Tag, Trash2 } from 'lucide-react';

const MasterData = () => {
  const { api } = useApi();
  const [activeTab, setActiveTab] = useState('hotels'); // hotels, airlines, categories
  
  // Data States
  const [hotels, setHotels] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [h, a, c] = await Promise.all([
        api.get('/hotels'),
        api.get('/airlines'),
        api.get('/categories')
      ]);
      setHotels(h.data || []);
      setAirlines(a.data || []);
      setCategories(c.data || []);
    } catch (err) {
      console.error("Error fetching master data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Endpoint dinamis berdasarkan tab aktif
      const endpoint = `/${activeTab}`;
      await api.post(endpoint, formData);
      
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if(!confirm('Hapus data ini?')) return;
    try {
        // Menggunakan endpoint delete global
        await api.delete(`/master/${activeTab}/${id}`);
        fetchData();
    } catch(err) {
        alert('Gagal menghapus');
    }
  }

  if (loading) return <div className="p-6"><Loading /></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Data</h1>
          <p className="text-gray-500">Kelola Hotel, Maskapai, dan Kategori Paket</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Tambah {activeTab === 'hotels' ? 'Hotel' : activeTab === 'airlines' ? 'Maskapai' : 'Kategori'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('hotels')} 
            className={`pb-3 px-4 flex items-center gap-2 font-medium ${activeTab === 'hotels' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          <Building size={18} /> Hotel
        </button>
        <button onClick={() => setActiveTab('airlines')} 
            className={`pb-3 px-4 flex items-center gap-2 font-medium ${activeTab === 'airlines' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          <Plane size={18} /> Maskapai
        </button>
        <button onClick={() => setActiveTab('categories')} 
            className={`pb-3 px-4 flex items-center gap-2 font-medium ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          <Tag size={18} /> Kategori
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase">
              <tr>
                {activeTab === 'hotels' && (
                  <> <th className="p-4">Nama Hotel</th> <th className="p-4">Kota</th> <th className="p-4">Bintang</th> <th className="p-4">Jarak</th> </>
                )}
                {activeTab === 'airlines' && (
                  <> <th className="p-4">Nama Maskapai</th> <th className="p-4">Kode</th> </>
                )}
                {activeTab === 'categories' && (
                  <> <th className="p-4">Nama Kategori</th> <th className="p-4">Slug</th> </>
                )}
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Render Hotels */}
              {activeTab === 'hotels' && hotels.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{h.name}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${h.city === 'Makkah' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>{h.city}</span></td>
                    <td className="p-4 text-yellow-500">{'★'.repeat(h.star_rating)}</td>
                    <td className="p-4">{h.distance_to_haram} m</td>
                    <td className="p-4 text-right"><button onClick={() => handleDelete(h.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td>
                </tr>
              ))}
              
              {/* Render Airlines */}
              {activeTab === 'airlines' && airlines.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{a.name}</td>
                    <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded font-mono">{a.code}</span></td>
                    <td className="p-4 text-right"><button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td>
                </tr>
              ))}

              {/* Render Categories */}
              {activeTab === 'categories' && categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4 text-gray-400 italic">{c.slug || '-'}</td>
                    <td className="p-4 text-right"><button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td>
                </tr>
              ))}
              
              {/* Empty State */}
              {((activeTab === 'hotels' && !hotels.length) || 
                (activeTab === 'airlines' && !airlines.length) || 
                (activeTab === 'categories' && !categories.length)) && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Data masih kosong. Silakan tambah baru.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
                Tambah {activeTab === 'hotels' ? 'Hotel' : activeTab === 'airlines' ? 'Maskapai' : 'Kategori'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Form Input Hotels */}
              {activeTab === 'hotels' && (
                <>
                  <input required placeholder="Nama Hotel" className="w-full border rounded p-2" onChange={e => setFormData({...formData, name: e.target.value})} />
                  <select className="w-full border rounded p-2" onChange={e => setFormData({...formData, city: e.target.value})}>
                    <option value="">Pilih Kota</option>
                    <option value="Makkah">Makkah</option>
                    <option value="Madinah">Madinah</option>
                  </select>
                  <select className="w-full border rounded p-2" onChange={e => setFormData({...formData, star_rating: e.target.value})}>
                    <option value="3">3 Bintang</option>
                    <option value="4">4 Bintang</option>
                    <option value="5">5 Bintang</option>
                  </select>
                  <input type="number" placeholder="Jarak (m)" className="w-full border rounded p-2" onChange={e => setFormData({...formData, distance_to_haram: e.target.value})} />
                </>
              )}

              {/* Form Input Airlines */}
              {activeTab === 'airlines' && (
                <>
                  <input required placeholder="Nama Maskapai" className="w-full border rounded p-2" onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input required placeholder="Kode (ex: SV)" className="w-full border rounded p-2 uppercase" onChange={e => setFormData({...formData, code: e.target.value})} />
                </>
              )}

              {/* Form Input Categories */}
              {activeTab === 'categories' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Nama Kategori</label>
                    <input required placeholder="Contoh: Paket Promo, VIP, Ramadhan" className="w-full border rounded p-2" 
                        onChange={e => setFormData({...formData, name: e.target.value})} />
                    <p className="text-xs text-gray-400 mt-1">*Slug akan dibuat otomatis</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;