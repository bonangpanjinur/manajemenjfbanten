import React, { useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { getStatusBadge, formatDate } from '../utils/helpers';

const LogComponent = () => {
    const { logs, users, loadingLogs, error, fetchLogs } = useApi();

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]); // Hapus dependensi yang tidak perlu
    
    const getUserName = (userId) => {
        const user = users.find(u => u.id == userId);
        return user ? user.full_name : 'Sistem';
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 relative min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Log Aktivitas</h2>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loadingLogs && <LoadingSpinner />}

            {!loadingLogs && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objek</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Objek</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Tidak ada log.</td>
                                </tr>
                            )}
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(log.created_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getUserName(log.user_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log.action)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.object_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.object_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LogComponent;