import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3.5 py-2.5 rounded-lg border bg-white text-secondary-900 text-sm
            placeholder:text-secondary-400 transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            ${error
              ? 'border-red-400 focus:ring-red-400/30 focus:border-red-500'
              : 'border-secondary-200 hover:border-secondary-300'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-secondary-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
