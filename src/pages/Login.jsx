import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    
    if (success) {
      // Redirect handled by AuthContext or manual here based on role if needed
      // But typically we navigate to 'from' or root, and App.jsx handles the routing
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-600 p-6 text-center">
            <h2 className="text-white text-2xl font-bold">JF Banten Travel</h2>
            <p className="text-green-100 mt-2">Sistem Manajemen Umrah & Haji</p>
        </div>

        <div className="p-8">
          {error && <ErrorMessage message={error} />}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Masukkan username anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? <Loading size="small" color="white" /> : 'Masuk Sistem'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
             Lupa password? Hubungi Admin Pusat.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;