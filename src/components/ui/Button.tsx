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
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide select-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:from-primary-600 hover:to-primary-700 hover:shadow-lg active:scale-[0.98] focus:ring-primary-500',
      secondary:
        'bg-white text-secondary-700 border border-secondary-300 shadow-sm hover:bg-secondary-50 hover:border-secondary-400 hover:shadow active:scale-[0.98] focus:ring-secondary-400',
      success:
        'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg active:scale-[0.98] focus:ring-emerald-500',
      danger:
        'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-[0.98] focus:ring-red-500',
      ghost:
        'bg-transparent text-secondary-600 hover:bg-secondary-100 hover:text-secondary-800 active:scale-[0.98] focus:ring-secondary-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
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
