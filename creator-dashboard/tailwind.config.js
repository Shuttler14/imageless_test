/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mn': {
          'teal': '#39A596',
          'teal-light': '#2dd4bf',
          'teal-dark': '#2a857a',
          'purple': '#8b5cf6',
          'purple-light': '#a78bfa',
          'gold': '#fbbf24',
          'gold-dark': '#d97706',
          'chrome': '#e5e7eb',
          'dark': '#0a0a0a',
          'dark-secondary': '#111111',
          'card': 'rgba(255, 255, 255, 0.03)',
          'border': 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(57, 165, 150, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(57, 165, 150, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}