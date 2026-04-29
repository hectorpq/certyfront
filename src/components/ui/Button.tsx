import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-bold rounded-btn transition-all duration-base ease-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none tracking-wide select-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white shadow-btn-primary hover:from-primary-800 hover:via-primary-700 hover:to-primary-600 hover:shadow-btn-hover hover:scale-[1.02] hover:-translate-y-0.5 active:translate-y-0 active:scale-100 focus:ring-primary-400',
      secondary:
        'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 border border-secondary-200 dark:border-secondary-600 shadow-sm hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/60 dark:hover:bg-primary-900/30 hover:scale-[1.02] hover:-translate-y-0.5 active:translate-y-0 active:scale-100 focus:ring-primary-400',
      success:
        'bg-gradient-to-r from-success-700 to-success-500 text-white shadow-[0_4px_15px_rgba(5,150,105,0.40)] hover:from-success-800 hover:to-success-600 hover:shadow-[0_6px_22px_rgba(5,150,105,0.55)] hover:scale-[1.02] hover:-translate-y-0.5 active:translate-y-0 active:scale-100 focus:ring-success-400',
      danger:
        'bg-gradient-to-r from-error-700 to-error-500 text-white shadow-[0_4px_15px_rgba(220,38,38,0.40)] hover:from-error-800 hover:to-error-600 hover:shadow-[0_6px_22px_rgba(220,38,38,0.55)] hover:scale-[1.02] hover:-translate-y-0.5 active:translate-y-0 active:scale-100 focus:ring-error-400',
      ghost:
        'bg-transparent text-secondary-600 dark:text-secondary-400 hover:bg-primary-50 dark:hover:bg-secondary-700 hover:text-primary-600 hover:scale-[1.02] hover:-translate-y-0.5 active:translate-y-0 active:scale-100 focus:ring-primary-400',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
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