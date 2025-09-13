/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4B00',
          50: '#FFE5D9',
          100: '#FFD1B8',
          200: '#FFA875',
          300: '#FF8033',
          400: '#FF5700',
          500: '#FF4B00',
          600: '#CC3C00',
          700: '#992D00',
          800: '#661E00',
          900: '#330F00'
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

