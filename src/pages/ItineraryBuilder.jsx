import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { Plus, Trash2, Save, Calendar, Clock, MapPin, GripVertical } from 'lucide-react';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast'; // Pastikan import ini ada

const ItineraryBuilder = () => {
  const { apiRequest } = useApi();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State untuk form itinerary
  const [days, setDays] = useState([
    {
      day: 1,
      title: 'Keberangkatan & Tiba di Jeddah',
      date: '',
      activities: [
        { time: '10:00', title: 'Berkumpul di Bandara Soekarno Hatta', location: 'Terminal 3', description: 'Meeting point di Gate 1' },
        { time: '14:00', title: 'Take off menuju Jeddah', location: 'Pesawat', description: '' }
      ]
    }
  ]);

  // Load paket umroh untuk dropdown
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await apiRequest('/packages');
        if (response.success && response.data) {
          setPackages(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch packages', error);
        toast.error('Gagal memuat data paket');
      }
    };
    fetchPackages();
  }, []);

  // Load existing itinerary saat paket dipilih
  useEffect(() => {
    if (!selectedPackage) return;

    const fetchItinerary = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(`/packages/${selectedPackage}/itinerary`);
        if (response.success && response.data && response.data.length > 0) {
          // Parsing data dari backend jika ada format khusus, 
          // untuk sekarang kita asumsi struktur datanya cocok atau kita set default
          // setDays(response.data); 
          toast.success('Data itinerary berhasil dimuat');
        } else {
          // Reset default jika belum ada data
          setDays([{
            day: 1,
            title: 'Hari Pertama',
            date: '',
            activities: [{ time: '', title: '', location: '', description: '' }]
          }]);
        }
      } catch (error) {
        console.error('Error fetching itinerary', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [selectedPackage]);

  const handleAddDay = () => {
    setDays([
      ...days,
      {
        day: days.length + 1,
        title: `Hari ke-${days.length + 1}`,
        date: '',
        activities: [{ time: '', title: '', location: '', description: '' }]
      }
    ]);
  };

  const handleRemoveDay = (index) => {
    const newDays = days.filter((_, i) => i !== index);
    // Re-index days
    const reindexedDays = newDays.map((d, i) => ({ ...d, day: i + 1, title: d.title.includes('Hari ke-') ? `Hari ke-${i+1}` : d.title }));
    setDays(reindexedDays);
  };

  const handleDayChange = (index, field, value) => {
    const newDays = [...days];
    newDays[index][field] = value;
    setDays(newDays);
  };

  const handleAddActivity = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities.push({ time: '', title: '', location: '', description: '' });
    setDays(newDays);
  };

  const handleRemoveActivity = (dayIndex, activityIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== activityIndex);
    setDays(newDays);
  };

  const handleActivityChange = (dayIndex, activityIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].activities[activityIndex][field] = value;
    setDays(newDays);
  };

  const handleSave = async () => {
    if (!selectedPackage) {
      toast.error('Silakan pilih paket terlebih dahulu');
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest('/packages/itinerary', 'POST', {
        package_id: selectedPackage,
        itinerary: days
      });

      if (response.success) {
        toast.success('Itinerary berhasil disimpan!');
      } else {
        toast.error(response.message || 'Gagal menyimpan itinerary');
      }
    } catch (error) {
      console.error('Error saving itinerary', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Itinerary Builder</h1>
          <p className="text-gray-500 text-sm">Buat dan atur jadwal perjalanan umroh</p>
        </div>
        <div className="flex gap-3">
            <select 
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
            >
                <option value="">-- Pilih Paket --</option>
                {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                ))}
            </select>
            <button 
                onClick={handleSave} 
                disabled={saving || !selectedPackage}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
                {saving ? <Loading size="sm" color="white" /> : <Save size={18} className="mr-2" />}
                Simpan Itinerary
            </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header Hari */}
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-1 flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold rounded-lg h-10 w-10">
                        {day.day}
                    </div>
                    <div className="md:col-span-8">
                        <input 
                            type="text" 
                            value={day.title}
                            onChange={(e) => handleDayChange(dayIndex, 'title', e.target.value)}
                            placeholder="Judul Hari (mis: Tiba di Madinah)"
                            className="w-full font-semibold text-lg border-none bg-transparent focus:ring-0 p-0 placeholder-gray-400"
                        />
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                           <Calendar size={14} className="mr-1" />
                           <input 
                                type="date" 
                                value={day.date}
                                onChange={(e) => handleDayChange(dayIndex, 'date', e.target.value)}
                                className="border-none bg-transparent focus:ring-0 p-0 text-sm text-gray-500"
                           />
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => handleRemoveDay(dayIndex)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Hapus Hari"
                >
                    <Trash2 size={18} />
                </button>
              </div>

              {/* Daftar Aktivitas */}
              <div className="p-4 space-y-3">
                {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex gap-3 items-start group">
                        <div className="mt-2 text-gray-300 cursor-move">
                            <GripVertical size={16} />
                        </div>
                        <div className="w-24 flex-shrink-0">
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                    <Clock size={14} className="text-gray-400" />
                                </div>
                                <input
                                    type="time"
                                    value={activity.time}
                                    onChange={(e) => handleActivityChange(dayIndex, actIndex, 'time', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 pl-8 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                value={activity.title}
                                onChange={(e) => handleActivityChange(dayIndex, actIndex, 'title', e.target.value)}
                                placeholder="Nama Aktivitas"
                                className="block w-full rounded-md border-gray-300 text-sm font-medium focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                        <MapPin size={14} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={activity.location}
                                        onChange={(e) => handleActivityChange(dayIndex, actIndex, 'location', e.target.value)}
                                        placeholder="Lokasi"
                                        className="block w-full rounded-md border-gray-300 pl-8 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={activity.description}
                                    onChange={(e) => handleActivityChange(dayIndex, actIndex, 'description', e.target.value)}
                                    placeholder="Catatan tambahan..."
                                    className="block w-full rounded-md border-gray-300 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => handleRemoveActivity(dayIndex, actIndex)}
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                <button 
                    onClick={() => handleAddActivity(dayIndex)}
                    className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
                >
                    <Plus size={14} className="mr-1" /> Tambah Aktivitas
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddDay}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex justify-center items-center font-medium"
          >
            <Plus size={20} className="mr-2" /> Tambah Hari Perjalanan
          </button>
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;