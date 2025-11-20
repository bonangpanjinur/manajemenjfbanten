import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Loading from '../components/common/Loading';

const HR = () => {
    const { apiCall, loading } = useApi();
    const [activeTab, setActiveTab] = useState('staff'); // staff, attendance, payroll
    const [employees, setEmployees] = useState([]);
    const [payroll, setPayroll] = useState([]);

    useEffect(() => {
        if (activeTab === 'staff' || activeTab === 'attendance') {
            apiCall('/hr/employees').then(res => setEmployees(res || []));
        }
        if (activeTab === 'payroll') {
            apiCall('/hr/payroll').then(res => setPayroll(res || []));
        }
    }, [activeTab]);

    // Handle Checkbox Absensi
    const handleAttendanceSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = employees.map(emp => ({
            id: emp.id,
            status: form[`status_${emp.id}`].value
        }));
        
        try {
            await apiCall('/hr/attendance', 'POST', { 
                date: new Date().toISOString().split('T')[0],
                employees: data 
            });
            alert('Absensi tersimpan!');
        } catch (err) {
            alert('Gagal simpan absensi');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manajemen HR</h1>
            
            <div className="flex space-x-4 mb-6 border-b">
                <button onClick={() => setActiveTab('staff')} className={`pb-2 px-4 ${activeTab==='staff' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Data Karyawan</button>
                <button onClick={() => setActiveTab('attendance')} className={`pb-2 px-4 ${activeTab==='attendance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Absensi Harian</button>
                <button onClick={() => setActiveTab('payroll')} className={`pb-2 px-4 ${activeTab==='payroll' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Gaji & Kasbon</button>
            </div>

            {loading ? <Loading /> : (
                <>
                    {activeTab === 'attendance' && (
                        <form onSubmit={handleAttendanceSubmit} className="bg-white p-6 rounded shadow">
                            <h3 className="font-bold mb-4">Absensi Hari Ini ({new Date().toLocaleDateString()})</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b"><th className="p-2">Nama</th><th className="p-2">Status</th></tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id} className="border-b">
                                            <td className="p-2">{emp.display_name}</td>
                                            <td className="p-2">
                                                <select name={`status_${emp.id}`} className="border p-1 rounded">
                                                    <option value="present">Hadir (Checklist)</option>
                                                    <option value="absent">Alpha/Absen</option>
                                                    <option value="sick">Sakit</option>
                                                    <option value="permission">Izin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Simpan Absensi</button>
                        </form>
                    )}

                    {activeTab === 'payroll' && (
                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="font-bold mb-4">Estimasi Gaji Bulan Ini</h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left">Nama</th>
                                        <th className="p-3 text-right">Gaji Pokok</th>
                                        <th className="p-3 text-right">Potongan Absen</th>
                                        <th className="p-3 text-right">Potongan Kasbon</th>
                                        <th className="p-3 text-right">Total Terima</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payroll.map((pay, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="p-3">{pay.name}</td>
                                            <td className="p-3 text-right">{parseInt(pay.basic).toLocaleString()}</td>
                                            <td className="p-3 text-right text-red-500">-{pay.absent_deduction.toLocaleString()} ({pay.absent_days} hari)</td>
                                            <td className="p-3 text-right text-red-500">-{pay.cashbond.toLocaleString()}</td>
                                            <td className="p-3 text-right font-bold text-green-600">{pay.net_salary.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {activeTab === 'staff' && (
                         <div className="text-center text-gray-500 py-10">Gunakan tombol "Tambah Pegawai" di pojok kanan atas untuk menambah data (Fitur sudah ada sebelumnya).</div>
                    )}
                </>
            )}
        </div>
    );
};

export default HR;