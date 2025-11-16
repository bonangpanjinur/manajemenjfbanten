import React from 'react';
import { Loader } from 'lucide-react';

export const LoadingSpinner = () => (
    <div className="loading-overlay" style={{ height: '300px', position: 'relative' }}>
        <Loader size={32} className="loader" />
    </div>
);

export const LoadingScreen = () => (
     <div className="loading-screen">
        <Loader size={48} className="loader" />
     </div>
);