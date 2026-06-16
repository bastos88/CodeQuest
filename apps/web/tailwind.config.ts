import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0B0F',
        surface: '#14151C',
        elevated: '#1E2029',
        elevatedSoft: '#252B3A',
        border: '#262B37',
        borderStrong: '#394154',
        textPrimary: '#F4F7FB',
        textSecondary: '#A7ADBD',
        textMuted: '#727A8E',
        primary: '#6C63FF',
        primaryHover: '#7B75FF',
        secondary: '#A855F7',
        accent: '#D946EF',
        info: '#3B82F6',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        halo: '0 24px 90px rgba(4, 6, 12, 0.42)',
        soft: '0 10px 30px rgba(4, 6, 12, 0.24)',
        glass: '0 16px 50px rgba(5, 8, 17, 0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
        glow: '0 0 0 1px rgba(108,99,255,0.16), 0 18px 60px rgba(68,56,180,0.28)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
