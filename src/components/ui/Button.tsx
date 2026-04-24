import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none tracking-wide select-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_4px_15px_0_rgba(59,130,246,0.45)] hover:from-primary-400 hover:to-primary-500 hover:shadow-[0_6px_22px_0_rgba(59,130,246,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_2px_8px_0_rgba(59,130,246,0.35)] focus:ring-primary-400',
      secondary:
        'bg-white text-secondary-700 border-2 border-secondary-200 shadow-sm hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 hover:-translate-y-0.5 active:translate-y-0 focus:ring-primary-400',
      success:
        'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_4px_15px_0_rgba(16,185,129,0.40)] hover:from-emerald-400 hover:to-emerald-500 hover:shadow-[0_6px_22px_0_rgba(16,185,129,0.50)] hover:-translate-y-0.5 active:translate-y-0 focus:ring-emerald-400',
      danger:
        'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_4px_15px_0_rgba(239,68,68,0.40)] hover:from-red-400 hover:to-red-500 hover:shadow-[0_6px_22px_0_rgba(239,68,68,0.50)] hover:-translate-y-0.5 active:translate-y-0 focus:ring-red-400',
      ghost:
        'bg-transparent text-secondary-600 hover:bg-primary-50 hover:text-primary-600 hover:-translate-y-0.5 active:translate-y-0 focus:ring-primary-400',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
