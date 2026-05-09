/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#F59E0B',
        accent: {
          DEFAULT: '#C8FF3D',
          ink: '#0A0B0D',
          soft: 'rgba(200,255,61,0.14)',
          glow: 'rgba(200,255,61,0.35)',
        },
        surface: {
          DEFAULT: '#13151A',
          light: '#FFFFFF',
        },
        background: {
          DEFAULT: '#0A0B0D',
          light: '#FAFAF7',
        },
        elevated: {
          DEFAULT: '#1B1E25',
          light: '#F4F4EE',
        },
        hairline: {
          DEFAULT: '#262932',
          2: '#1F222A',
          light: '#E5E5DD',
        },
        text: {
          DEFAULT: '#F4F5F7',
          light: '#0F1115',
        },
        muted: {
          DEFAULT: '#8B8F9A',
          light: '#61656E',
        },
        dim: {
          DEFAULT: '#5A5E69',
          light: '#989BA3',
        },
        success: '#22C55E',
        good: '#7BD88F',
        warning: '#EAB308',
        warn: '#E8C454',
        danger: '#EF4444',
        bad: '#E96A6A',
        info: '#7AA9FF',
      },
      fontFamily: {
        sans: ['"Inter Tight"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
        pill: '999px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
