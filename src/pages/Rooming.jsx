import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';
import { Bed, Users, Plus, Trash2, CheckCircle, ArrowRight } from 'lucide-react';

const Rooming = () => {
  const { api } = useApi();
  
  // --- State Seleksi ---
  const [packages, setPackages] = useState([]);
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [pkgHotels, setPkgHotels] = useState([]);
  const [selectedPhId, setSelectedPhId] = useState(''); // ID Package Hotel
  
  // --- State Data Rooming ---
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- State Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ number: '', type: 'Quad', guests: [] });

  // 1. Load Daftar Paket (Active Only)
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const res = await api.get('/packages?status=active');
        setPackages(res.data || []);
      } catch (e) { console.error("Gagal load paket", e); }
    };
    loadPackages();
  }, []);

  // 2. Load Hotel ketika Paket dipilih
  useEffect(() => {
    if (!selectedPkgId) { setPkgHotels([]); setSelectedPhId(''); return; }
    const pkg = packages.find(p => p.id == selectedPkgId);
    // Pastikan backend API Packages mengembalikan data 'hotels' (relasi)
    if (pkg && pkg.hotels) setPkgHotels(pkg.hotels);
    else setPkgHotels([]);
  }, [selectedPkgId, packages]);

  // 3. Fetch Rooming Data Utama
  const fetchRooming = async () => {
    if (!selectedPhId) return;
    setLoading(true);
    try {
      const res = await api.get(`/rooming/${selectedPhId}`);
      setRoomData(res.data);
    } catch (e) {
      console.error(e);
      // Jangan alert error 404 jika data masih kosong/belum dibuat (mungkin user baru buka menu ini)
      if (e.response && e.response.status !== 404) {
          alert("Gagal memuat data rooming.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(selectedPhId) fetchRooming();
    else setRoomData(null);
  }, [selectedPhId]);

  // --- Logic Form ---

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (newRoom.guests.length === 0) {
        alert("Pilih minimal 1 jamaah untuk masuk kamar ini.");
        return;
    }
    try {
        await api.post(`/rooming/${selectedPhId}`, {
            room_number: newRoom.number,
            room_type: newRoom.type,
            booking_ids: newRoom.guests
        });
        setIsModalOpen(false);
        setNewRoom({ number: '', type: 'Quad', guests: [] }); // Reset form
        fetchRooming(); // Refresh data
    } catch (e) { alert("Gagal membuat kamar."); }
  };

  const toggleGuestSelection = (bookingId) => {
    const current = newRoom.guests;
    if (current.includes(bookingId)) {
        setNewRoom({ ...newRoom, guests: current.filter(id => id !== bookingId) });
    } else {
        // Validasi Kapasitas
        const limits = { 'Quad': 4, 'Triple': 3, 'Double': 2 };
        if (current.length >= limits[newRoom.type]) {
            alert(`Maksimal ${limits[newRoom.type]} orang untuk tipe kamar ${newRoom.type}`);
            return;
        }
        setNewRoom({ ...newRoom, guests: [...current, bookingId] });
    }
  };
  
  const handleDeleteRoom = async (id) => {
    if(!confirm("Hapus kamar ini? Penghuni akan kembali ke status 'Belum Dapat Kamar'.")) return;
    try {
        await api.delete(`/rooming/room/${id}`);
        fetchRooming();
    } catch(e) { alert("Gagal menghapus kamar"); }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bed className="text-blue-600"/> Rooming List
          </h1>
          <p className="text-gray-500 text-sm">Manajemen pembagian kamar hotel jamaah</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <select className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 py-2 px-3 cursor-pointer" 
                value={selectedPkgId} onChange={e => { setSelectedPkgId(e.target.value); setSelectedPhId(''); }}>
                <option value="">-- 1. Pilih Paket --</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ArrowRight size={16} className="text-gray-400"/>
            <select className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 py-2 px-3 cursor-pointer"
                value={selectedPhId} onChange={e => setSelectedPhId(e.target.value)} disabled={!selectedPkgId}>
                <option value="">-- 2. Pilih Hotel --</option>
                {pkgHotels.map(ph => <option key={ph.id} value={ph.id}>{ph.hotel_name} ({ph.city})</option>)}
            </select>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedPhId ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Bed size={48} className="mx-auto mb-4 text-gray-300"/>
            <h3 className="text-lg font-medium text-gray-500">Silakan pilih Paket dan Hotel terlebih dahulu</h3>
            <p className="text-sm text-gray-400">Data kamar dan jamaah akan muncul di sini.</p>
        </div>
      ) : loading ? (
        <Loading />
      ) : roomData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KIRI: Daftar Jamaah Belum Dapat Kamar */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border flex flex-col h-[calc(100vh-200px)] sticky top-6">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center rounded-t-xl">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <Users size={18}/> Belum Dapat Kamar
                    </h3>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        {roomData.unassigned.length}
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {roomData.unassigned.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm italic">
                            <CheckCircle size={32} className="mx-auto mb-2 text-green-400"/>
                            Semua jamaah sudah dapat kamar!
                        </div>
                    )}
                    {roomData.unassigned.map(j => (
                        <div key={j.booking_id} className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors">
                            <div>
                                <p className="font-medium text-sm text-gray-800">{j.full_name}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${j.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                        {j.gender === 'L' ? 'Pria' : 'Wanita'}
                                    </span>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border">
                                        Req: {j.selected_room_type}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setNewRoom(prev => ({...prev, guests: [j.booking_id]}));
                                    setIsModalOpen(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-1.5 rounded-md shadow hover:bg-blue-700 transition-all"
                                title="Buat Kamar Baru dengan Jamaah ini"
                            >
                                <Plus size={14}/>
                            </button>
                        </div>
                    ))}
                </div>
                
                <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex justify-center items-center gap-2 shadow-sm"
                    >
                        <Plus size={16}/> Buat Kamar Baru
                    </button>
                </div>
            </div>

            {/* KANAN: Visualisasi Kamar (Room Grid) */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">
                        Daftar Kamar Terisi ({roomData.rooms.length})
                    </h3>
                </div>

                {roomData.rooms.length === 0 && (
                    <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
                        Belum ada kamar yang dibuat untuk hotel ini.
                        <br/>Klik tombol "Buat Kamar Baru" di panel kiri.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomData.rooms.map(room => (
                        <div key={room.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Header Kamar */}
                            <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-lg">Kamar {room.room_number}</h4>
                                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-200">
                                        {room.room_type} ({room.guests.length} Org)
                                    </span>
                                </div>
                                <button onClick={() => handleDeleteRoom(room.id)} className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-700 transition-colors">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                            
                            {/* List Penghuni */}
                            <div className="p-3 space-y-2 bg-white min-h-[100px]">
                                {room.guests.map((guest, idx) => (
                                    <div key={guest.guest_id} className="flex items-center gap-3 text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                        <span className="text-xs text-gray-400 w-4">{idx+1}.</span>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${guest.gender === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                            {guest.gender}
                                        </div>
                                        <span className="text-gray-700 font-medium">{guest.full_name}</span>
                                    </div>
                                ))}
                                {room.guests.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-xs text-red-400 bg-red-50 rounded py-4">
                                        Kamar Kosong
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      ) : null}

      {/* Modal Setup Kamar */}
      {isModalOpen && roomData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Setup Kamar Baru</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {/* Form Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Nomor Kamar</label>
                    <input autoFocus type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Cth: 101, 205"
                        value={newRoom.number} onChange={e => setNewRoom({...newRoom, number: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Tipe Kamar</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})}>
                        <option value="Quad">Quad (Isi 4)</option>
                        <option value="Triple">Triple (Isi 3)</option>
                        <option value="Double">Double (Isi 2)</option>
                    </select>
                </div>
            </div>
            
            {/* Guest Selection */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Pilih Jamaah ({newRoom.guests.length} terpilih)
                    </label>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Klik nama untuk memilih
                    </span>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-3 max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50">
                    {roomData.unassigned.length === 0 && <p className="col-span-2 text-center text-gray-400 py-4">Tidak ada jamaah tersisa.</p>}
                    {roomData.unassigned.map(j => {
                        const isSelected = newRoom.guests.includes(j.booking_id);
                        return (
                            <div key={j.booking_id} 
                                onClick={() => toggleGuestSelection(j.booking_id)}
                                className={`p-2.5 rounded-lg cursor-pointer border transition-all flex items-center gap-3 ${
                                    isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                                }`}
                            >
                                {isSelected ? <CheckCircle size={18} className="text-white"/> : <div className="w-[18px] h-[18px] rounded-full border border-gray-300"></div>}
                                <div className="truncate text-sm font-medium">
                                    {j.full_name} 
                                    <span className={`ml-1 text-xs opacity-70 font-normal`}>({j.gender})</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    Batal
                </button>
                <button onClick={handleCreateRoom} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition-all transform active:scale-95">
                    Simpan Kamar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooming;