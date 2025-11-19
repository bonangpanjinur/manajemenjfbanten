// File Location: ./tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Menambahkan z-index tinggi agar modal tampil di atas admin bar WP
      zIndex: {
        '100000': '100000',
      }
    },
  },
  plugins: [],
  // Penting: Preflight false agar tidak merusak style bawaan WP Admin secara total
  corePlugins: {
    preflight: false, 
  }
}