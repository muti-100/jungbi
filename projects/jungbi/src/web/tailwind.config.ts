import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        primary: {
          50:  '#EDF4FC',
          100: '#D6E6F7',
          500: '#2468B2',
          600: '#1E5799',
          700: '#1A4A7A',
          800: '#12335C',
          900: '#0C2340',
        },
        accent: {
          100: '#FEF3C7',
          500: '#D97706',
          600: '#B45309',
        },
        success: {
          100: '#DCFCE7',
          600: '#16A34A',
        },
        danger: {
          100: '#FEE2E2',
          600: '#DC2626',
        },
        warning: {
          100: '#FEF9C3',
          600: '#CA8A04',
        },
        info: {
          100: '#CFFAFE',
          600: '#0891B2',
        },
        neutral: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          400: '#9CA3AF',
          600: '#4B5563',
          800: '#1F2937',
          950: '#0A0A0B',
        },
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.06)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 24px rgba(0,0,0,0.14)',
        xl: '0 16px 48px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      maxWidth: {
        '8xl': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
