import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import { FaPlaneDeparture, FaKaaba, FaFileInvoiceDollar, FaPassport } from 'react-icons/fa';

const JamaahPortal = () => {
  const { user } = useAuth();

  // Mock data - nanti diganti dengan data dari API Jemaah
  const jamaahData = {
    paket: "Umroh VIP Ramadhan",
    keberangkatan: "20 Maret 2025",
    statusVisa: "Issued",
    pembayaran: "Lunas"
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
      {/* Header Mobile */}
      <div className="bg-green-600 p-6 rounded-b-3xl text-white mb-6">
        <h1 className="text-2xl font-bold">Assalamu'alaikum,</h1>
        <p className="text-lg opacity-90">{user?.name || 'Jemaah'}</p>
        <div className="mt-4 bg-green-700 p-3 rounded-lg flex items-center justify-between">
           <span>Status: </span>
           <span className="font-bold bg-white text-green-700 px-2 py-1 rounded text-sm">
             Calon Jemaah
           </span>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Info Paket */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Paket Anda</h3>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
               <FaKaaba />
            </div>
            <div>
              <p className="font-bold text-gray-800">{jamaahData.paket}</p>
              <p className="text-sm text-gray-500">{jamaahData.keberangkatan}</p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl flex flex-col items-center gap-2 transition">
            <FaFileInvoiceDollar className="text-2xl text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Riwayat Bayar</span>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl flex flex-col items-center gap-2 transition">
            <FaPassport className="text-2xl text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Dokumen & Visa</span>
          </button>

          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl flex flex-col items-center gap-2 transition">
            <FaPlaneDeparture className="text-2xl text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Itinerary</span>
          </button>

           <button className="p-4 bg-teal-50 hover:bg-teal-100 rounded-xl flex flex-col items-center gap-2 transition">
            <span className="text-2xl">🤲</span>
            <span className="text-sm font-medium text-gray-700">Doa-doa</span>
          </button>
        </div>

        {/* Timeline Visa (Simple) */}
        <div className="mt-6">
            <h3 className="text-gray-800 font-bold mb-3">Status Dokumen</h3>
            <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="flex-1">Paspor Diserahkan</span>
                <span className="text-green-600 font-bold">✓</span>
            </div>
            <div className="h-4 border-l-2 border-gray-200 ml-1.5"></div>
            <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="flex-1">Visa Issued</span>
                <span className="text-green-600 font-bold">✓</span>
            </div>
             <div className="h-4 border-l-2 border-gray-200 ml-1.5"></div>
            <div className="flex items-center gap-2 text-sm opacity-50">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="flex-1">Tiket Terbit</span>
                <span>-</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JamaahPortal;