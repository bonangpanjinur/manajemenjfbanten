import React from 'react';

// --- Components ---

const Input = React.forwardRef(({ label, error, type = "text", className = "", ...props }, ref) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    error ? 'border-red-300' : 'border-gray-300'
                }`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        </div>
    );
});

const Select = React.forwardRef(({ label, error, options = [], className = "", ...props }, ref) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                    error ? 'border-red-300' : 'border-gray-300'
                }`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        </div>
    );
});

const TextArea = React.forwardRef(({ label, error, rows = 3, className = "", ...props }, ref) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    error ? 'border-red-300' : 'border-gray-300'
                }`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        </div>
    );
});

const Button = ({ children, isLoading, variant = 'primary', type = 'button', className = "", ...props }) => {
    const baseStyle = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        secondary: "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    };

    return (
        <button
            type={type}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                </>
            ) : children}
        </button>
    );
};

// --- Export Default Object ---
// Ini memperbaiki error "export 'default' not found"
const FormUI = {
    Input,
    Select,
    TextArea, // Pastikan konsisten TextArea vs Textarea
    Button
};

export default FormUI;

// Export Named Exports juga (opsional, untuk fleksibilitas)
export { Input, Select, TextArea, Button };