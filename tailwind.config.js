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
          bg: '#080C14',
          panel: '#0E1626',
          panelHeader: '#121D31',
          surface: '#152238',
          surfaceHover: '#1B2B47',
          border: '#1E2F4D',
          borderLight: '#2A4066',
          cyan: '#00E5FF',
          blue: '#0284C7',
          blueLight: '#38BDF8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          textMuted: '#64748B',
          textPrimary: '#F1F5F9',
          textSecondary: '#94A3B8',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
