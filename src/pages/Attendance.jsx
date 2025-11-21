import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';

export default function Attendance() {
    const { api } = useApi();
    const [statusData, setStatusData] = useState(null); // Data hari ini
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clock, setClock] = useState(new Date());
    const [location, setLocation] = useState(null);
    const [gpsError, setGpsError] = useState('');
    const [processing, setProcessing] = useState(false);

    // 1. Jam Digital Live
    useEffect(() => {
        const timer = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Get Data Awal
    useEffect(() => {
        fetchData();
        getLocation();
    }, []);

    const fetchData = async () => {
        try {
            const todayRes = await api.get('/attendance/today');
            setStatusData(todayRes);
            
            const histRes = await api.get('/attendance/history');
            setHistory(histRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Logic GPS
    const getLocation = () => {
        if (!navigator.geolocation) {
            setGpsError('Browser Anda tidak mendukung Geolocation.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setGpsError('');
            },
            (error) => {
                console.error(error);
                setGpsError('Gagal mengambil lokasi. Pastikan GPS aktif dan izin diberikan.');
            },
            { enableHighAccuracy: true }
        );
    };

    // 4. Handle Absen
    const handleClock = async (type) => {
        if (!location) {
            alert('Sedang mencari lokasi GPS... Tunggu sebentar atau refresh halaman.');
            getLocation();
            return;
        }

        setProcessing(true);
        try {
            await api.post('/attendance/clock', {
                type: type,
                lat: location.lat,
                lng: location.lng
            });
            alert(type === 'in' ? 'Selamat bekerja! Absen masuk berhasil.' : 'Terima kasih! Hati-hati di jalan.');
            fetchData(); // Refresh UI
        } catch (error) {
            alert(error.message || 'Gagal melakukan presensi.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <Loading />;

    const isCheckedIn = statusData?.status === 'checked_in';
    const canCheckOut = statusData?.can_check_out;

    return (
        <div className="max-w-md mx-auto space-y-6 pb-10">
            {/* Header Mobile Style */}
            <div className="text-center py-4">
                <h1 className="text-2xl font-bold text-gray-800">Presensi Karyawan</h1>
                <p className="text-sm text-gray-500">PT. Travel Umrah Banten</p>
            </div>

            {/* Jam Digital & Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100">
                <div className="text-gray-500 text-sm font-medium mb-2">
                    {clock.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="text-5xl font-bold text-blue-600 tracking-tight font-mono mb-4">
                    {clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                {/* GPS Status Indicator */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${location ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${location ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {location ? 'GPS Terkunci Akurat' : 'Mencari GPS...'}
                </div>
                {gpsError && <p className="text-xs text-red-500 mt-2">{gpsError}</p>}
            </div>

            {/* Tombol Aksi Utama */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleClock('in')}
                    disabled={isCheckedIn || processing || !location}
                    className={`p-6 rounded-xl shadow-md flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                        isCheckedIn 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg'
                    }`}
                >
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    <span className="font-bold text-lg">Absen Masuk</span>
                    {isCheckedIn && <span className="text-xs mt-1">{statusData?.data?.check_in_time?.split(' ')[1]}</span>}
                </button>

                <button
                    onClick={() => handleClock('out')}
                    disabled={!isCheckedIn || !canCheckOut || processing || !location}
                    className={`p-6 rounded-xl shadow-md flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                        !isCheckedIn || !canCheckOut
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg'
                    }`}
                >
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="font-bold text-lg">Absen Pulang</span>
                    {statusData?.data?.check_out_time && <span className="text-xs mt-1">{statusData?.data?.check_out_time?.split(' ')[1]}</span>}
                </button>
            </div>

            {/* Maps Preview (Jika sudah absen) */}
            {isCheckedIn && statusData?.data && (
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Lokasi Anda Hari Ini</h3>
                    <div className="aspect-video w-full bg-gray-200 rounded overflow-hidden relative">
                         <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight="0" 
                            marginWidth="0" 
                            src={`https://maps.google.com/maps?q=${statusData.data.check_in_lat},${statusData.data.check_in_lng}&z=15&output=embed`}
                         ></iframe>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>Masuk: {statusData.data.check_in_time}</span>
                        {statusData.data.check_out_time && <span>Pulang: {statusData.data.check_out_time}</span>}
                    </div>
                </div>
            )}

            {/* History List */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 px-2">Riwayat 30 Hari Terakhir</h3>
                <div className="space-y-3">
                    {history.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-gray-800">
                                    {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    <span className="text-green-600 font-medium">IN: {item.check_in_time ? item.check_in_time.split(' ')[1] : '-'}</span>
                                    <span className="mx-2">|</span>
                                    <span className="text-red-600 font-medium">OUT: {item.check_out_time ? item.check_out_time.split(' ')[1] : '-'}</span>
                                </div>
                            </div>
                            <div>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    item.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Belum ada riwayat presensi.</p>
                    )}
                </div>
            </div>
        </div>
    );
}