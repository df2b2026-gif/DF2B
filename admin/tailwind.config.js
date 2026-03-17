/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        df2b: {
          bg: '#0F1419',
          'bg-secondary': '#1A1F26',
          'bg-card': '#252B33',
          accent: '#D4A574',
          'accent-light': '#E8C9A0',
          text: '#F5F0E8',
          'text-secondary': '#B8B0A4',
          'text-muted': '#8A817A',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
