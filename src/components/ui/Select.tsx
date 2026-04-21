import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3.5 py-2.5 rounded-lg border bg-white text-secondary-900 text-sm
            transition-all duration-150 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            ${error
              ? 'border-red-400 focus:ring-red-400/30 focus:border-red-500'
              : 'border-secondary-200 hover:border-secondary-300'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
