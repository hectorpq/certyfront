import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const Card = ({ children, className = '', title, subtitle, action }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_1px_4px_0_rgba(0,0,0,0.06),0_4px_16px_0_rgba(0,0,0,0.06)] border border-secondary-100 overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/60">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-secondary-900 tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-secondary-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
