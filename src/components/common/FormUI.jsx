import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

// Label Component
const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">
        {children} {required && <span className="text-red-500">*</span>}
    </label>
);

// Error Message Component
const ErrorText = ({ message }) => (
    <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500 animate-fade-in">
        <AlertCircle size={14} />
        <span className="text-xs font-medium">{message}</span>
    </div>
);

// --- INPUT ---
const Input = React.forwardRef(({ label, error, type = "text", className = "", required, ...props }, ref) => {
    return (
        <div className={`w-full ${className}`}>
            {label && <Label required={required}>{label}</Label>}
            <div className="relative">
                <input
                    ref={ref}
                    type={type}
                    className={`
                        w-full px-4 py-2.5
                        bg-white border text-gray-900 text-sm rounded-xl
                        placeholder:text-gray-400
                        transition-all duration-200
                        disabled:bg-gray-50 disabled:text-gray-500
                        ${error 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                        }
                        focus:ring-4 focus:outline-none
                    `}
                    {...props}
                />
            </div>
            {error && <ErrorText message={error.message} />}
        </div>
    );
});

// --- SELECT ---
const Select = React.forwardRef(({ label, error, options = [], className = "", required, placeholder, ...props }, ref) => {
    return (
        <div className={`w-full ${className}`}>
            {label && <Label required={required}>{label}</Label>}
            <div className="relative">
                <select
                    ref={ref}
                    className={`
                        w-full px-4 py-2.5 appearance-none
                        bg-white border text-gray-900 text-sm rounded-xl
                        cursor-pointer
                        transition-all duration-200
                        disabled:bg-gray-50
                        ${error 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                        }
                        focus:ring-4 focus:outline-none pr-10
                    `}
                    {...props}
                >
                    {placeholder && <option value="" disabled hidden>{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {/* Custom Chevron Icon (Absolute Position) */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <ChevronDown size={16} strokeWidth={2.5} />
                </div>
            </div>
            {error && <ErrorText message={error.message} />}
        </div>
    );
});

// --- TEXTAREA ---
const TextArea = React.forwardRef(({ label, error, rows = 3, className = "", required, ...props }, ref) => {
    return (
        <div className={`w-full ${className}`}>
            {label && <Label required={required}>{label}</Label>}
            <textarea
                ref={ref}
                rows={rows}
                className={`
                    w-full px-4 py-2.5
                    bg-white border text-gray-900 text-sm rounded-xl
                    placeholder:text-gray-400
                    transition-all duration-200
                    resize-y min-h-[80px]
                    ${error 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                    }
                    focus:ring-4 focus:outline-none
                `}
                {...props}
            />
            {error && <ErrorText message={error.message} />}
        </div>
    );
});

// --- BUTTON ---
const Button = ({ children, isLoading, variant = 'primary', type = 'button', className = "", ...props }) => {
    const baseStyle = "inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]";
    
    const variants = {
        primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-100 shadow-lg shadow-blue-500/20 border border-transparent",
        secondary: "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-100 shadow-sm",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-100 shadow-lg shadow-red-500/20 border border-transparent",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent",
    };

    return (
        <button
            type={type}
            className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="opacity-90">Loading...</span>
                </>
            ) : children}
        </button>
    );
};

// Export Object & Named Exports
const FormUI = { Input, Select, TextArea, Button };
export default FormUI;
export { Input, Select, TextArea, Button };