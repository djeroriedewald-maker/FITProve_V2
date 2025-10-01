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
          DEFAULT: '#FFF700', // Neon yellow
          50: '#FFFFE5',
          100: '#FFFFB8',
          200: '#FFFF75',
          300: '#FFF733',
          400: '#FFF700',
          500: '#FFF700',
          600: '#CCCC00',
          700: '#999900',
          800: '#666600',
          900: '#333300',
        },
        neon: {
          yellow: '#FFF700',
        },
        background: {
          light: '#ffffff',
          dark: '#000000',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
