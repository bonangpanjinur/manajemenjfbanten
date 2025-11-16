import React, { forwardRef } from 'react';

// -- STYLING HELPER (PENGGANTI clsx) --
const cn = (...classes) => classes.filter(Boolean).join(' ');

// -- Button --
export const Button = forwardRef(({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    children, 
    ...props 
}, ref) => {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        icon: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full focus-visible:ring-gray-300',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
        icon: 'p-2',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center gap-2 font-medium rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'icon' ? sizes.icon : sizes[size],
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});
Button.displayName = 'Button';

// -- Input --
export const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
    return (
        <input
            type={type}
            ref={ref}
            className={cn(
                'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'disabled:bg-gray-100 disabled:cursor-not-allowed',
                'text-sm',
                className
            )}
            {...props}
        />
    );
});
Input.displayName = 'Input';

// -- Select --
export const Select = forwardRef(({ className, children, ...props }, ref) => {
    return (
        <select
            ref={ref}
            className={cn(
                'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'text-sm',
                className
            )}
            {...props}
        >
            {children}
        </select>
    );
});
Select.displayName = 'Select';

// -- Textarea --
export const Textarea = forwardRef(({ className, ...props }, ref) => {
    return (
        <textarea
            ref={ref}
            className={cn(
                'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'text-sm',
                'min-h-[80px]',
                className
            )}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';

// -- Form Components --
export const FormGroup = ({ className, children }) => (
    <div className={cn('mb-4', className)}>{children}</div>
);

export const FormLabel = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-gray-700 mb-1', className)}>
        {children}
    </label>
);

export const Checkbox = forwardRef(({ className, label, ...props }, ref) => (
    <div className="flex items-center gap-2">
        <input
            type="checkbox"
            ref={ref}
            id={props.id || props.name}
            className={cn(
                'h-4 w-4 text-blue-600 border-gray-300 rounded',
                'focus:ring-blue-500',
                className
            )}
            {...props}
        />
        {label && <FormLabel htmlFor={props.id || props.name} className="mb-0">{label}</FormLabel>}
    </div>
));
Checkbox.displayName = 'Checkbox';