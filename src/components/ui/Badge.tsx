interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  dot?: boolean;
}

export const Badge = ({ children, variant = 'default', dot = false }: BadgeProps) => {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--bg-secondary)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    },
    success: {
      background: 'var(--color-success-soft, #ECFDF5)',
      color: 'var(--color-success, #059669)',
      border: '1px solid rgba(5,150,105,0.22)',
    },
    warning: {
      background: 'var(--color-warning-soft, #FFFBEB)',
      color: 'var(--color-warning, #D97706)',
      border: '1px solid rgba(217,119,6,0.22)',
    },
    error: {
      background: 'var(--color-error-soft, #FEF2F2)',
      color: 'var(--color-error, #DC2626)',
      border: '1px solid rgba(220,38,38,0.22)',
    },
    info: {
      background: 'var(--color-info-soft, #EFF6FF)',
      color: 'var(--color-info, #2563EB)',
      border: '1px solid rgba(37,99,235,0.22)',
    },
  };

  const dotColors: Record<string, string> = {
    default: 'var(--text-muted)',
    success: 'var(--color-success, #059669)',
    warning: 'var(--color-warning, #D97706)',
    error:   'var(--color-error, #DC2626)',
    info:    'var(--color-info, #2563EB)',
  };

  return (
    <span
      style={{
        ...styles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
    >
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: dotColors[variant],
          flexShrink: 0,
          boxShadow: `0 0 5px ${dotColors[variant]}80`,
        }} />
      )}
      {children}
    </span>
  );
};