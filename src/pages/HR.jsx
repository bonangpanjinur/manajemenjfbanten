import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import { Users, UserPlus, Trash2, Edit } from 'lucide-react';

const HR = () => {
  const { api } = useApi();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Jabatan Dinamis: Input teks biasa atau bisa select dari list unique yang sudah ada
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    salary: 0,
    status: 'active'
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
         // Logic Update
         // Pastikan API HR support PUT /employees/id
         // Jika belum, Anda perlu update api-hr.php method update_item
         await api.put(`/employees/${editId}`, formData); 
      } else {
         await api.post('/employees', formData);
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      alert('Gagal menyimpan data: ' + err.message);
    }
  };

  const openEdit = (emp) => {
      setFormData(emp);
      setEditId(emp.id);
      setIsModalOpen(true);
  }

  const openAdd = () => {
      setFormData({ name: '', position: '', phone: '', email: '', salary: 0, status: 'active' });
      setEditId(null);
      setIsModalOpen(true);
  }

  const handleDelete = async (id) => {
      if(!confirm("Hapus data karyawan ini?")) return;
      try {
          await api.delete(`/employees/${id}`);
          fetchEmployees();
      } catch(e) { alert("Gagal hapus"); }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Data HR & Karyawan</h1>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <UserPlus size={18} /> Tambah Karyawan
        </button>
      </div>

      {loading ? <Loading /> : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b uppercase text-gray-500">
                    <tr>
                        <th className="p-4">Nama</th>
                        <th className="p-4">Jabatan</th>
                        <th className="p-4">Kontak</th>
                        <th className="p-4">Gaji</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {employees.map(e => (
                        <tr key={e.id}>
                            <td className="p-4 font-medium">{e.name}</td>
                            <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{e.position}</span></td>
                            <td className="p-4">{e.phone}</td>
                            <td className="p-4">Rp {parseFloat(e.salary).toLocaleString()}</td>
                            <td className="p-4">{e.status}</td>
                            <td className="p-4 text-right flex justify-end gap-2">
                                <button onClick={() => openEdit(e)} className="text-indigo-600"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(e.id)} className="text-red-600"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      )}

      {/* Modal Simple untuk HR */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                  <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Karyawan' : 'Karyawan Baru'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-3">
                      <input className="w-full border p-2 rounded" placeholder="Nama Lengkap" required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
                      {/* Jabatan Dinamis (Text Input) */}
                      <input className="w-full border p-2 rounded" placeholder="Jabatan (cth: Manager, Staff, Driver)" required value={formData.position} onChange={e=>setFormData({...formData, position:e.target.value})} />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <input className="w-full border p-2 rounded" placeholder="No HP" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
                        <input className="w-full border p-2 rounded" placeholder="Gaji Pokok" type="number" value={formData.salary} onChange={e=>setFormData({...formData, salary:e.target.value})} />
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4">
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

export default HR;