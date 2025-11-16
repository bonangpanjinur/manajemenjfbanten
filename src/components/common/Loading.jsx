import React from 'react';
import { Loader } from 'lucide-react';

export const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-50 min-h-[200px]">
        <Loader size={32} className="animate-spin text-blue-600" />
    </div>
);

export const LoadingScreen = () => (
     <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        <Loader size={48} className="animate-spin text-blue-600" />
     </div>
);