/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        leather: {
          50: '#fdf8f3',
          100: '#f9edd8',
          200: '#f2d9b0',
          300: '#e8bf7e',
          400: '#dba04d',
          500: '#c9862e',
          600: '#a86823',
          700: '#8B4513',
          800: '#6b3411',
          900: '#4a240d',
        },
        gold: {
          400: '#d4af37',
          500: '#c5a028',
          600: '#b08d1f',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
