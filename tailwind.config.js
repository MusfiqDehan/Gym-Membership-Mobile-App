/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './index.js',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Fitssort brand palette (mirrors the web app dark theme)
        brand: {
          DEFAULT: '#FFC300',
          50: '#FFF8E1',
          100: '#FFECB3',
          300: '#FFD95A',
          400: '#FFCF2D',
          500: '#FFC300',
          600: '#E0AB00',
        },
        ink: {
          950: '#050505',
          900: '#0d0d0d',
          800: '#141414',
          700: '#1c1c1c',
          600: '#262626',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Manrope', 'System'],
      },
    },
  },
  plugins: [],
};
