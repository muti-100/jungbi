import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E86A3A',
          50: '#FDF2EE',
          100: '#FBE0D3',
          200: '#F6BFA8',
          300: '#F19D7C',
          400: '#ED7C51',
          500: '#E86A3A',
          600: '#D4521F',
          700: '#B04419',
          800: '#8C3613',
          900: '#68280E',
        },
        secondary: {
          DEFAULT: '#3A7BD5',
          50: '#EEF4FC',
          100: '#D4E4F8',
          200: '#A9CAF1',
          300: '#7DB0EA',
          400: '#5295E3',
          500: '#3A7BD5',
          600: '#2963B8',
          700: '#1F4C93',
          800: '#15366E',
          900: '#0B2049',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#0F0F0F',
        },
        muted: {
          DEFAULT: '#6B7280',
          foreground: '#9CA3AF',
        },
      },
      fontFamily: {
        pretendard: ['Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh':
          'radial-gradient(at 40% 20%, hsla(28, 78%, 57%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(220, 65%, 53%, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(28, 78%, 57%, 0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08), 0 4px 10px -5px rgba(0,0,0,0.05)',
        glow: '0 0 40px rgba(232, 106, 58, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
