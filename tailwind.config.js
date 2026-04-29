/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────────────────────
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        info: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],           // UI general
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],// Títulos
        mono:    ['Montserrat', 'Inter', 'monospace'],           // Números KPI
      },
      fontSize: {
        'h1':     ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'module': ['20px', { lineHeight: '1.3', fontWeight: '700' }],
        'body':   ['14px', { lineHeight: '1.6' }],
        'body-lg':['15px', { lineHeight: '1.6' }],
        'kpi':    ['32px', { lineHeight: '1.1', fontWeight: '700' }],
      },

      // ─── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        'card':    '18px',   // Cards
        'btn':     '14px',   // Botones
        'input':   '12px',   // Inputs
        'sidebar': '16px',   // Items sidebar
        'kpi':     '20px',   // Cards KPI
      },

      // ─── Spacing (base 8px) ────────────────────────────────────────────────
      spacing: {
        'dashboard':  '24px',   // Padding general del dashboard
        'card-gap':   '20px',   // Separación entre cards
        'card-pad':   '24px',   // Padding interno de cards
        'widget-gap': '28px',   // Gap entre widgets grandes
        'sidebar':    '260px',  // Ancho sidebar expandido
        'sidebar-col':'72px',   // Ancho sidebar colapsado
        'nav-item':   '48px',   // Altura items de navegación
      },

      // ─── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        // Modo claro
        'card':          '0 8px 30px rgba(37,99,235,0.10)',
        'card-hover':    '0 12px 40px rgba(0,0,0,0.06)',
        'card-elevated': '0 12px 40px rgba(0,0,0,0.06)',
        // Dark mode glow
        'glow':          '0 0 18px rgba(41,98,255,0.22)',
        'glow-sm':       '0 0 12px rgba(59,130,246,0.30)',
        'glow-lg':       '0 0 40px rgba(59,130,246,0.50)',
        // Sidebar
        'sidebar':       '4px 0 24px rgba(37,99,235,0.25)',
        // Botones
        'btn-primary':   '0 4px 15px rgba(59,130,246,0.45)',
        'btn-hover':     '0 6px 22px rgba(59,130,246,0.55)',
        // Nav activo
        'nav-active':    '0 2px 12px rgba(0,0,0,0.20)',
      },

      // ─── Transitions ───────────────────────────────────────────────────────
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ─── Backdrop ──────────────────────────────────────────────────────────
      backdropBlur: {
        'glass': '14px',
      },
    },
  },
  plugins: [],
}
