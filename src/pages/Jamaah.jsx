import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, Phone, FileText } from 'lucide-react';
import Modal from '../components/common/Modal';
import JamaahForm from '../components/forms/JamaahForm';
import Loading from '../components/common/Loading';

const Jamaah = () => {
  const { data: jamaahList, loading, error, fetchData, createData, updateData, deleteData } = useApi('jamaah');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJamaah, setSelectedJamaah] = useState(null);
  
  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const filteredData = jamaahList?.filter(item => 
    item.nama_lengkap?.toLowerCase().includes(searchTerm) ||
    item.no_passport?.toLowerCase().includes(searchTerm)
  ) || [];

  const handleAdd = () => {
    setSelectedJamaah(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedJamaah(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (selectedJamaah) {
      await updateData(selectedJamaah.id, formData);
    } else {
      await createData(formData);
    }
    setIsModalOpen(false);
    fetchData(); // Refresh list
  };

  const handleDelete = async (id) => {
    if(window.confirm("Apakah anda yakin ingin menghapus data jemaah ini?")) {
      await deleteData(id);
      fetchData();
    }
  };

  if (loading && !jamaahList) return <Loading />;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Jemaah</h1>
          <p className="text-sm text-gray-500">Kelola data jemaah Umrah & Haji</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Jemaah
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama, paspor, atau NIK..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Data Grid / Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jemaah</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paket</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Kontak</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Pembayaran</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                        {item.nama_lengkap?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.nama_lengkap}</div>
                        <div className="text-xs text-gray-500">{item.nik || item.no_passport}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-700">{item.paket_name || 'Belum Pilih Paket'}</span>
                    <div className="text-xs text-gray-400">{item.tgl_keberangkatan}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-col text-sm text-gray-600">
                       <span className="flex items-center gap-1"><Phone size={12}/> {item.no_telp}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                      ${item.status_pembayaran === 'Lunas' 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                      {item.status_pembayaran || 'Belum Bayar'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Tidak ada data jemaah ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedJamaah ? "Edit Data Jemaah" : "Tambah Jemaah Baru"}>
        <JamaahForm 
          initialData={selectedJamaah} 
          onSubmit={handleSubmit} 
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Jamaah;