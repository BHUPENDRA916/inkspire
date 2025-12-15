import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#6A84F2',
          DEFAULT: '#4A64F0',
          dark: '#3A50C4',
        },
        secondary: {
          light: '#FF8A65',
          DEFAULT: '#FF7043',
          dark: '#F4511E',
        },
      },
    },
  },
  plugins: [forms],
};