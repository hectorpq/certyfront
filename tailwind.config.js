/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(59,130,246,0.30)',
        'glow':    '0 0 24px rgba(59,130,246,0.40)',
        'glow-lg': '0 0 40px rgba(59,130,246,0.50)',
        'card':    '0 4px 6px -1px rgba(0,0,0,0.06), 0 10px 40px -8px rgba(0,0,0,0.10)',
        'card-hover': '0 8px 16px -2px rgba(0,0,0,0.08), 0 20px 48px -8px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
