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
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={className}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 12,
            border: `1px solid ${error ? 'var(--color-error, #DC2626)' : 'var(--border)'}`,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontFamily: 'Inter, system-ui',
            outline: 'none',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxShadow: error
              ? '0 0 0 3px rgba(220,38,38,0.12)'
              : 'none',
          }}
          onFocus={e => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--color-primary, #2563EB)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-soft, rgba(37,99,235,0.12))';
            }
          }}
          onBlur={e => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          {...props}
        />
        {error && (
          <p style={{ marginTop: 5, fontSize: 12, fontWeight: 500, color: 'var(--color-error, #DC2626)' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p style={{ marginTop: 5, fontSize: 12, color: 'var(--text-muted)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';