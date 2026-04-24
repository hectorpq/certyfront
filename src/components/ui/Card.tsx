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
      className={`bg-white rounded-2xl shadow-card border border-secondary-100/80 overflow-hidden transition-shadow duration-200 hover:shadow-card-hover ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-5 border-b border-secondary-100 flex items-center justify-between bg-gradient-to-r from-primary-50/60 to-white">
          <div>
            {title && (
              <h3 className="text-base font-bold text-secondary-900 tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-secondary-500 mt-0.5 font-medium">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-6 lg:p-8">{children}</div>
    </div>
  );
};
