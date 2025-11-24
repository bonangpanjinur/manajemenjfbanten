/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // PERBAIKAN DISINI: ID harus sama dengan div wrapper di dashboard-react.php
  important: '#umroh-manager-hybrid-root', 
  theme: {
    extend: {
      zIndex: {
        '100000': '100000',
      },
      colors: {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
  corePlugins: {
    // Matikan preflight bawaan agar tidak merusak menu admin WP lain
    preflight: false, 
  }
}