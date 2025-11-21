import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import JamaahForm from '../components/forms/JamaahForm';
import { UserPlus, Printer, Search, FileText } from 'lucide-react';

const Jamaah = () => {
  const { getJamaahList, loading } = useApi(); // Pastikan getJamaahList ada di context
  const [jamaahList, setJamaahList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const data = await getJamaahList({ search });
      setJamaahList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handlePrintForm = (id) => {
    // Membuka tab baru ke script PHP print registration
    // Pastikan admin-post action 'umh_print_registration' sudah ada di api-print.php
    const url = `/wp-admin/admin-post.php?action=umh_print_registration&id=${id}`;
    window.open(url, '_blank', 'width=900,height=800');
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Data Jemaah</h1>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari nama / paspor..." 
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {/* TOMBOL TAMBAH JEMAAH (Fix Poin 2) */}
            <button 
                onClick={handleAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow"
            >
                <UserPlus size={18} /> <span className="hidden sm:inline">Tambah Jemaah</span>
            </button>
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="bg-white rounded-xl shadow overflow-hidden border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase">
              <tr>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Paket</th>
                <th className="p-4">Keberangkatan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jamaahList.length === 0 && (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-400">Belum ada data jemaah.</td></tr>
              )}
              {jamaahList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{item.full_name}</div>
                    <div className="text-xs text-gray-500">{item.passport_number || 'No Passport'}</div>
                  </td>
                  <td className="p-4 text-gray-700">{item.package_name || '-'}</td>
                  <td className="p-4 text-gray-600">{item.departure_date || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.payment_status === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {/* TOMBOL PRINT FORMULIR (Fix Poin 2) */}
                    <button 
                        onClick={() => handlePrintForm(item.booking_id || item.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded hover:bg-blue-50 transition"
                        title="Cetak Formulir"
                    >
                        <FileText size={16} />
                    </button>
                    <button 
                        onClick={() => { setEditData(item); setIsModalOpen(true); }} 
                        className="text-indigo-600 hover:underline text-sm font-medium"
                    >
                        Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? "Edit Jemaah" : "Registrasi Jemaah Baru"}>
        <JamaahForm initialData={editData} onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Jamaah;