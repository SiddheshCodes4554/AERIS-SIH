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
          bg: '#070909',
          panel: '#111516',
          surface: '#181D1E',
          surfaceHover: '#202628',
          border: 'rgba(255, 255, 255, 0.07)',
          borderLight: 'rgba(255, 255, 255, 0.12)',
          
          textPrimary: '#F2F4F3',
          textSecondary: '#8C9492',
          textMuted: '#58605E',

          // Status & Intelligence Accents
          green: '#62C370',
          blue: '#3B8EDB',
          amber: '#E2A24C',
          red: '#FF453A',
          purple: '#9B7EDB',
          cyan: '#00E5FF',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Geist', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'aeris-panel': '0 10px 30px rgba(0, 0, 0, 0.5)',
        'glow-green': '0 0 12px rgba(98, 195, 112, 0.35)',
        'glow-blue': '0 0 12px rgba(59, 142, 219, 0.35)',
        'glow-amber': '0 0 12px rgba(226, 162, 76, 0.35)',
        'glow-red': '0 0 12px rgba(255, 69, 58, 0.35)',
      },
      borderRadius: {
        'panel': '16px',
        'card': '12px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
