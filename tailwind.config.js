/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dsu: {
          blue: '#1E3A8A', // Deep Academic Navy
          gold: '#D97706', // College Gold
          light: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}

