/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        background: '#0F0F1A',
        card: '#1A1A2E',
        primary: '#6366F1', // Indigo - Focus
        secondary: '#8B5CF6', // Violet - Sleep
        accent: '#06B6D4', // Cyan - Relax
        text: '#E2E8F0',
        textMuted: '#94A3B8',
      }
    },
  },
  plugins: [],
}
