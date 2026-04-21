/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial Hebrew', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
