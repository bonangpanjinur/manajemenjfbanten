import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 border border-red-200 animate-fade-in">
      <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
      <span className="sr-only">Error</span>
      <div className="text-sm font-medium">
        {message}
      </div>
    </div>
  );
};

export default ErrorMessage;