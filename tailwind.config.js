/** @type {import('tailwindcss').Config} */
module.exports = {
  // Pastikan baris ini mencakup semua file React Anda
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#009688', // Teal default
        secondary: '#00796b',
      }
    },
  },
  plugins: [],
  // Penting: Nonaktifkan preflight jika merusak tampilan admin WP lain,
  // tapi biasanya kita butuh ini untuk React app kita.
  // Jika tampilan WP Admin jadi aneh, set preflight: false
  corePlugins: {
    preflight: true, 
  }
}