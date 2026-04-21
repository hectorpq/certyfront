import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3.5 py-2.5 rounded-lg border bg-white text-secondary-900 text-sm
            placeholder:text-secondary-400 transition-all duration-150 resize-none
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            ${error
              ? 'border-red-400 focus:ring-red-400/30 focus:border-red-500'
              : 'border-secondary-200 hover:border-secondary-300'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
