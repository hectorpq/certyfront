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
      className={`rounded-card border overflow-hidden transition-all duration-slow ease-smooth ${className}`}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 36px rgba(37,99,235,0.14)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(37,99,235,0.08)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {(title || action) && (
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(90deg, var(--color-primary-soft, #EFF6FF) 0%, var(--bg-card) 100%)',
          }}
        >
          <div>
            {title && (
              <h3
                className="text-base font-bold tracking-tight"
                style={{ fontFamily: 'Poppins, Inter, system-ui', color: 'var(--text-primary)' }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};