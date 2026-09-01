/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aeris: {
          bg: '#080A0C',
          surface1: '#101315',
          surface2: '#15191B',
          surface3: '#1B2022',
          card: 'rgba(22, 26, 28, 0.88)',
          cardSubtle: 'rgba(18, 22, 24, 0.82)',
          cardAlert: 'rgba(38, 20, 20, 0.75)',
          border: 'rgba(255, 255, 255, 0.06)',
          borderHover: 'rgba(255, 255, 255, 0.12)',
          borderActive: 'rgba(255, 255, 255, 0.20)',
          
          textPrimary: '#F1F3F2',
          textSecondary: '#9A9F9D',
          textMuted: '#656B69',

          // Status & Accent Colors
          green: '#65C466',
          amber: '#D99A4A',
          red: '#FF3B30',
          blue: '#3B8EDB',
          cyan: '#00E5FF',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Geist', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'aeris-card': '0 20px 60px rgba(0, 0, 0, 0.45)',
        'aeris-glow-blue': '0 0 20px rgba(59, 142, 219, 0.25)',
        'aeris-glow-green': '0 0 20px rgba(101, 196, 102, 0.25)',
        'aeris-glow-amber': '0 0 20px rgba(217, 154, 74, 0.25)',
        'aeris-glow-red': '0 0 20px rgba(255, 59, 48, 0.25)',
      },
      borderRadius: {
        'card': '24px',
        'panel': '28px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
