import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity"
          style={{ background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        />

        {/* Panel */}
        <div
          className={`relative w-full ${sizes[size]} max-h-[90vh] flex flex-col overflow-hidden`}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 20,
            border: '1px solid var(--border)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22), 0 8px 24px rgba(37,99,235,0.12)',
          }}
        >
          {/* Accent top bar */}
          <div style={{
            height: 3,
            background: 'linear-gradient(90deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)',
            flexShrink: 0,
          }} />

          {title && (
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h3
                className="text-base font-bold tracking-tight"
                style={{ fontFamily: 'Poppins, Inter', color: 'var(--text-primary)' }}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};