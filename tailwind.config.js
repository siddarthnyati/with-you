/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#FFF5F0',
        blush: '#F4A0B5',
        rose: '#C4607A',
        wine: '#7A2A3A',
      },
    },
  },
  plugins: [],
};
