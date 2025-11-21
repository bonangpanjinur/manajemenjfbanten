import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import { Users, UserPlus, DollarSign, Trash2 } from 'lucide-react';

const HR = () => {
  const { api } = useApi();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    position: 'Staff',
    phone: '',
    email: '',
    salary: 0,
    join_date: new Date().toISOString().split('T')[0]
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Gagal load data HR", err);
      // Jika error 404 (belum ada data), set array kosong
      if (err.response && err.response.status === 404) {
         setEmployees([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', formData);
      setIsModalOpen(false);
      setFormData({ name: '', position: 'Staff', phone: '', email: '', salary: 0, join_date: new Date().toISOString().split('T')[0] });
      fetchEmployees();
    } catch (err) {
      alert('Gagal menyimpan data karyawan');
    }
  };

  const handleDelete = async (id) => {
    if(!confirm('Hapus karyawan ini?')) return;
    try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
    } catch(err) {
        alert("Gagal menghapus data");
    }
  };

  if (loading) return <div className="p-6"><Loading /></div>;

  // Kalkulasi Gaji
  const totalSalary = employees.reduce((sum, emp) => sum + parseFloat(emp.salary || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Human Resources</h1>
          <p className="text-gray-500">Manajemen Data Karyawan & Penggajian</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <UserPlus size={18} /> Tambah Karyawan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24}/></div>
            <div>
                <p className="text-sm text-gray-500">Total Karyawan</p>
                <h3 className="text-2xl font-bold">{employees.length}</h3>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><DollarSign size={24}/></div>
            <div>
                <p className="text-sm text-gray-500">Total Beban Gaji (Bulanan)</p>
                <h3 className="text-2xl font-bold">Rp {totalSalary.toLocaleString()}</h3>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase">
              <tr>
                <th className="p-4">Nama</th>
                <th className="p-4">Jabatan</th>
                <th className="p-4">Kontak</th>
                <th className="p-4">Gaji Pokok</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{emp.name}</td>
                  <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{emp.position}</span></td>
                  <td className="p-4">
                    <div className="flex flex-col text-xs text-gray-500">
                        <span>{emp.phone}</span>
                        <span>{emp.email}</span>
                    </div>
                  </td>
                  <td className="p-4">Rp {parseFloat(emp.salary).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {emp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Belum ada data karyawan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Tambah Karyawan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                    <input type="text" required className="w-full border rounded p-2"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Jabatan</label>
                    <select className="w-full border rounded p-2"
                        value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                        <option value="Staff">Staff</option>
                        <option value="Manager">Manager</option>
                        <option value="Tour Leader">Tour Leader</option>
                        <option value="Muthawif">Muthawif</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">No. HP</label>
                        <input type="text" required className="w-full border rounded p-2"
                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Gaji Pokok</label>
                        <input type="number" className="w-full border rounded p-2"
                            value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email (Opsional)</label>
                    <input type="email" className="w-full border rounded p-2"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                
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

export default HR;