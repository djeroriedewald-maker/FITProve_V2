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
        // Glass morphism inspired palette
        primary: {
          DEFAULT: '#00E5FF', // Cyan blue
          50: '#E0F9FF',
          100: '#B8F2FF',
          200: '#7AEBFF',
          300: '#3CE3FF',
          400: '#00E5FF',
          500: '#00BCD4',
          600: '#0097A7',
          700: '#00796B',
          800: '#004D40',
          900: '#00251A',
        },
        secondary: {
          DEFAULT: '#B400FF', // Purple
          50: '#F3E5FF',
          100: '#E1CCFF',
          200: '#C299FF',
          300: '#A366FF',
          400: '#8533FF',
          500: '#B400FF',
          600: '#9100CC',
          700: '#6E0099',
          800: '#4B0066',
          900: '#280033',
        },
        accent: {
          DEFAULT: '#FF6B35', // Orange
          50: '#FFF4F0',
          100: '#FFE4D6',
          200: '#FFC5AD',
          300: '#FFA084',
          400: '#FF7B5B',
          500: '#FF6B35',
          600: '#E5512A',
          700: '#CC3B1F',
          800: '#B22914',
          900: '#991B09',
        },
        glass: {
          // Glass morphism backgrounds
          white: 'rgba(255, 255, 255, 0.1)',
          'white-light': 'rgba(255, 255, 255, 0.05)',
          'white-heavy': 'rgba(255, 255, 255, 0.2)',
          black: 'rgba(0, 0, 0, 0.3)',
          'black-light': 'rgba(0, 0, 0, 0.1)',
          'black-heavy': 'rgba(0, 0, 0, 0.5)',
        },
        neon: {
          cyan: '#00E5FF',
          purple: '#B400FF',
          orange: '#FF6B35',
          green: '#00FF87',
          pink: '#FF1493',
        },
        background: {
          primary: '#0A0A0F', // Deep dark blue
          secondary: '#151520', // Slightly lighter
          tertiary: '#1F1F2E', // Cards/panels
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'neon-gradient': 'linear-gradient(45deg, #00E5FF, #B400FF, #FF6B35)',
        'workout-gradient': 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(180,0,255,0.2) 50%, rgba(255,107,53,0.2) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 15px 35px rgba(31, 38, 135, 0.2)',
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(180, 0, 255, 0.5)',
        'neon-orange': '0 0 20px rgba(255, 107, 53, 0.5)',
        'cyan-glow': '0 0 15px rgba(6, 182, 212, 0.4)',
        'purple-glow': '0 0 15px rgba(147, 51, 234, 0.4)',
        'orange-glow': '0 0 15px rgba(234, 88, 12, 0.4)',
        'inner-glass': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 229, 255, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
