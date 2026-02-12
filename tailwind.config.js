/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef1fb',
          100: '#d4daf5',
          200: '#a9b5eb',
          300: '#7e90e0',
          400: '#536bd6',
          500: '#1a3ab5',
          600: '#162f91',
          700: '#1a2b6d',
          800: '#131e4d',
          900: '#0d1433',
        },
      },
    },
  },
  plugins: [],
}
