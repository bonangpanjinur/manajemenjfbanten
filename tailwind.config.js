/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // PENTING: Menambahkan selector ID ini membuat semua class Tailwind 
  // memiliki prioritas lebih tinggi daripada style bawaan WP Admin.
  important: '#umh-admin-app',
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
    // Kita tetap matikan preflight global agar tidak merusak WP Admin bar,
    // tapi kita akan buat preflight manual di index.css
    preflight: false, 
  }
}