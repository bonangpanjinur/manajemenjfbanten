import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Calendar, Clock, BookOpen, FileText, User } from 'lucide-react';

// Ini adalah halaman "Mobile App" untuk Jemaah
// Desainnya vertikal, card-based, dan sangat simpel

const Portal = () => {
  const { user } = useAuth();
  
  // Data Mockup Jemaah (Nanti ambil dari API berdasarkan user.id)
  const tripInfo = {
    paket: "Umrah Akbar 12 Hari",
    berangkat: "15 Oktober 2024",
    status: "Siap Berangkat",
    hotel_mekkah: "Zam Zam Tower",
    hotel_madinah: "Ruve Al Madinah",
    pembimbing: "Ustadz Hanan"
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto shadow-2xl overflow-hidden border-x border-gray-100 relative">
      
      {/* Header with Islamic Pattern Background */}
      <div className="bg-emerald-600 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-emerald-100 text-sm">Ahlan Wa Sahlan,</p>
              <h1 className="text-2xl font-bold">{user?.name || "Hamba Allah"}</h1>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User size={20} />
            </div>
          </div>
          
          {/* Main Status Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-400 text-amber-900 p-1.5 rounded-lg">
                <Clock size={16} />
              </div>
              <span className="text-sm font-medium">Hitung Mundur</span>
            </div>
            <h2 className="text-3xl font-bold text-center my-2">24 <span className="text-base font-normal">Hari Lagi</span></h2>
            <div className="text-center text-xs text-emerald-100 bg-emerald-800/30 py-1 rounded-full">
              Keberangkatan: {tripInfo.berangkat}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Menu Grid */}
      <div className="grid grid-cols-4 gap-4 p-6 -mt-2">
        {[
          { icon: FileText, label: "Dokumen", color: "blue" },
          { icon: MapPin, label: "Itinerary", color: "amber" },
          { icon: BookOpen, label: "Doa", color: "emerald" },
          { icon: Calendar, label: "Jadwal", color: "purple" },
        ].map((item, idx) => (
          <button key={idx} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-100 text-${item.color}-600 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform`}>
              <item.icon size={24} />
            </div>
            <span className="text-xs font-medium text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Info Cards List */}
      <div className="px-6 space-y-4">
        <h3 className="font-bold text-gray-800">Detail Perjalanan</h3>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
          <div className="bg-gray-100 p-3 rounded-lg">
            <MapPin className="text-gray-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400">Hotel Mekkah</p>
            <p className="font-semibold text-gray-800">{tripInfo.hotel_mekkah}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
          <div className="bg-gray-100 p-3 rounded-lg">
            <MapPin className="text-gray-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400">Hotel Madinah</p>
            <p className="font-semibold text-gray-800">{tripInfo.hotel_madinah}</p>
          </div>
        </div>
        
        {/* Doa Harian Widget */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-xl shadow-lg text-white mt-6">
          <div className="flex items-start gap-3">
             <BookOpen className="mt-1 opacity-80" size={20} />
             <div>
               <h4 className="font-bold text-sm mb-1">Doa Safar</h4>
               <p className="text-xs opacity-90 italic">"Subhanalladzi sakhara lana hadza..."</p>
               <button className="mt-3 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition">Baca Lengkap</button>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-3 px-6 flex justify-around items-center max-w-md mx-auto right-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button className="flex flex-col items-center gap-1 text-emerald-600">
          <MapPin size={22} fill="currentColor" className="opacity-20" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <BookOpen size={22} />
          <span className="text-[10px]">Panduan</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <User size={22} />
          <span className="text-[10px]">Profil</span>
        </button>
      </div>

    </div>
  );
};

export default Portal;