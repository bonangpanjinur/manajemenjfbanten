import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import { UserPlus, Search, Printer, FileText } from 'lucide-react'; // Import icon baru

// ... (Kode import komponen modal/form lainnya tetap sama)

const Jamaah = () => {
  const { api } = useApi();
  const [jamaahList, setJamaahList] = useState([]);
  // ... (State lainnya tetap sama)

  // --- FUNGSI CETAK FORMULIR ---
  const handlePrintForm = (bookingId) => {
    const printUrl = `/wp-admin/admin-post.php?action=umh_print_registration&id=${bookingId}`;
    window.open(printUrl, '_blank', 'width=900,height=800');
  };

  // ... (Fungsi fetchJamaah dll tetap sama)

  // Di bagian Table Render:
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ... Header ... */}
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase">
              <tr>
                <th className="p-4">Kode Booking</th>
                <th className="p-4">Nama Jamaah</th>
                <th className="p-4">Paket</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jamaahList.map((item) => (
                <tr key={item.booking_id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-blue-600">{item.booking_code}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{item.full_name}</div>
                    <div className="text-xs text-gray-500">{item.passport_number || 'No Passport'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-900">{item.package_name}</div>
                    <div className="text-xs text-gray-500">{item.departure_date}</div>
                  </td>
                  <td className="p-4">
                     <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {item.booking_status}
                     </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {/* TOMBOL CETAK FORMULIR */}
                    <button 
                        onClick={() => handlePrintForm(item.booking_id)}
                        className="text-gray-500 hover:text-blue-600 bg-gray-100 p-2 rounded-lg transition-colors"
                        title="Cetak Formulir Pendaftaran"
                    >
                        <FileText size={18} />
                    </button>

                    {/* Tombol Edit/Delete yang sudah ada */}
                    {/* ... */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ... Modal ... */}
    </div>
  );
};

export default Jamaah;