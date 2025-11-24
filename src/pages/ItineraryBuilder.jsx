import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loading from '../components/common/Loading';

// --- BAGIAN IKON SVG NATIVE (Pengganti react-icons agar bebas error) ---
const Icons = {
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  MapMarker: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  )
};

const ItineraryBuilder = ({ packageId: propPackageId, existingData, onSaveSuccess }) => {
  const { post, get } = useApi();
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  // Prioritas ID: Props (jika embedded) > URL Param (jika halaman full)
  const packageId = propPackageId || paramId;
  
  const [paketName, setPaketName] = useState('');
  const [days, setDays] = useState([
    { id: Date.now(), day: 1, title: 'Keberangkatan & Tiba', activities: [] }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Effect: Fetch data jika ID tersedia dan belum ada existingData
  useEffect(() => {
    const fetchData = async () => {
      if (paramId && !existingData) {
        setIsLoadingData(true);
        try {
          const res = await get(`/packages/${paramId}`);
          if (res.success) {
            setPaketName(res.data.name);
            // Validasi struktur JSON itinerary
            if (res.data.itinerary && Array.isArray(res.data.itinerary)) {
              setDays(res.data.itinerary);
            }
          }
        } catch (error) {
          console.error("Gagal ambil data paket:", error);
          toast.error("Gagal memuat data paket.");
        } finally {
          setIsLoadingData(false);
        }
      } else if (existingData) {
        if (existingData.name) setPaketName(existingData.name);
        if (existingData.itinerary && Array.isArray(existingData.itinerary)) {
          setDays(existingData.itinerary);
        }
      }
    };

    fetchData();
  }, [paramId, existingData, get]);

  // --- LOGIC MANIPULASI ITINERARY ---

  const addDay = () => {
    const newDayNum = days.length + 1;
    setDays([...days, { id: Date.now(), day: newDayNum, title: '', activities: [] }]);
  };

  const removeDay = (id) => {
    const filtered = days.filter(d => d.id !== id);
    // Re-index nomor hari agar urut kembali (H1, H2, dst)
    const reIndexed = filtered.map((d, idx) => ({ ...d, day: idx + 1 }));
    setDays(reIndexed);
  };

  const updateDayTitle = (id, title) => {
    setDays(days.map(d => d.id === id ? { ...d, title } : d));
  };

  const addActivity = (dayId) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        const newActivities = Array.isArray(d.activities) ? d.activities : [];
        return {
          ...d,
          activities: [...newActivities, { id: Date.now(), time: '08:00', location: '', description: '' }]
        };
      }
      return d;
    }));
  };

  const updateActivity = (dayId, activityId, field, value) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        const newActivities = d.activities.map(a => 
          a.id === activityId ? { ...a, [field]: value } : a
        );
        return { ...d, activities: newActivities };
      }
      return d;
    }));
  };

  const removeActivity = (dayId, activityId) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        return { ...d, activities: d.activities.filter(a => a.id !== activityId) };
      }
      return d;
    }));
  };

  const handleSave = async () => {
    if (!packageId) {
      toast.error("ID Paket tidak valid (Pastikan paket sudah dibuat sebelumnya).");
      return;
    }

    try {
      setIsSaving(true);
      
      const payload = {
        id: packageId,
        // Kirim object khusus agar backend PHP tahu ini update itinerary
        itinerary_data: days 
      };

      const response = await post(`/packages/${packageId}`, payload);

      if (response.success) {
        toast.success("Itinerary berhasil disimpan!");
        if (onSaveSuccess) onSaveSuccess();
      } else {
        toast.error("Gagal menyimpan: " + (response.message || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Gagal menghubungi server.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) return <Loading />;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          {/* Tombol Back muncul jika diakses via URL */}
          {paramId && (
            <button 
              onClick={() => navigate('/packages')} 
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
              title="Kembali ke Daftar Paket"
            >
               <Icons.ArrowLeft />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-green-600"><Icons.Calendar /></span>
              Itinerary Builder
            </h1>
            <p className="text-sm text-gray-500">
              {paketName ? `Mengedit: ${paketName}` : 'Susun rencana perjalanan detail per hari'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition
            ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Menyimpan...' : <><Icons.Save /> Simpan Perubahan</>}
        </button>
      </div>

      {/* Container List Hari */}
      <div className="space-y-6">
        {days.map((day, index) => (
          <div key={day.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition hover:shadow-md">
            
            {/* Header Per Hari (H1, H2...) */}
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="bg-green-600 text-white font-bold w-12 h-12 flex items-center justify-center rounded-lg shadow-sm shrink-0 text-lg">
                  H{index + 1}
                </div>
                <div className="w-full">
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Judul Kegiatan Utama</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Tiba di Madinah & Check-in Hotel"
                      className="bg-transparent font-bold text-lg text-gray-800 placeholder-gray-400 w-full outline-none border-b border-transparent focus:border-green-500 transition py-1"
                      value={day.title}
                      onChange={(e) => updateDayTitle(day.id, e.target.value)}
                    />
                </div>
              </div>
              <button 
                onClick={() => removeDay(day.id)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                title="Hapus Hari Ini"
              >
                <Icons.Trash />
              </button>
            </div>

            {/* List Aktivitas per Jam */}
            <div className="p-4 bg-white">
              {(!day.activities || day.activities.length === 0) && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg mb-4 bg-gray-50">
                  <p>Belum ada aktivitas detail di hari ke-{index + 1}</p>
                  <button 
                    onClick={() => addActivity(day.id)}
                    className="mt-2 text-green-600 font-medium hover:underline text-sm inline-flex items-center gap-1"
                  >
                    <Icons.Plus /> Tambah aktivitas pertama
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {day.activities && day.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 items-start group">
                    <div className="mt-3 text-gray-300 group-hover:text-green-500 transition">
                      <Icons.MapMarker />
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 group-hover:border-green-200 transition">
                      {/* Input Jam */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-2 py-2">
                          <span className="text-gray-400"><Icons.Clock /></span>
                          <input 
                            type="time" 
                            className="w-full text-sm outline-none font-medium text-gray-700"
                            value={activity.time}
                            onChange={(e) => updateActivity(day.id, activity.id, 'time', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Input Lokasi */}
                      <div className="md:col-span-3">
                        <input 
                          type="text" 
                          placeholder="Lokasi (Cth: Masjid Nabawi)"
                          className="w-full text-sm p-2 bg-white border border-gray-200 rounded focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                          value={activity.location}
                          onChange={(e) => updateActivity(day.id, activity.id, 'location', e.target.value)}
                        />
                      </div>

                      {/* Input Deskripsi */}
                      <div className="md:col-span-6">
                        <input 
                          type="text" 
                          placeholder="Deskripsi kegiatan..."
                          className="w-full text-sm p-2 bg-white border border-gray-200 rounded focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                          value={activity.description}
                          onChange={(e) => updateActivity(day.id, activity.id, 'description', e.target.value)}
                        />
                      </div>

                      {/* Tombol Hapus Aktivitas */}
                      <div className="md:col-span-1 flex justify-center items-center">
                         <button 
                            onClick={() => removeActivity(day.id, activity.id)}
                            className="text-gray-400 hover:text-red-500 p-2 transition"
                            title="Hapus Aktivitas"
                          >
                            <Icons.Trash />
                          </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Tambah Aktivitas */}
              <button 
                onClick={() => addActivity(day.id)}
                className="mt-4 text-sm text-green-700 bg-green-50 font-medium flex items-center justify-center gap-2 hover:bg-green-100 px-4 py-2.5 rounded-lg transition w-full border border-green-100"
              >
                <Icons.Plus /> Tambah Kegiatan
              </button>
            </div>
          </div>
        ))}

        {/* Tombol Tambah Hari Baru */}
        <button 
          onClick={addDay}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition flex items-center justify-center gap-2 group"
        >
          <div className="bg-gray-200 group-hover:bg-green-600 text-gray-500 group-hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition">
             <Icons.Plus />
          </div>
          Tambah Hari Perjalanan (H{days.length + 1})
        </button>
      </div>
    </div>
  );
};

export default ItineraryBuilder;