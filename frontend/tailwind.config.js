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
        primary: {
          DEFAULT: '#1C3F24', // Deep Botanical Green
          light: '#2A5C36',
          dark: '#0F2615',
        },
        secondary: {
          DEFAULT: '#C5A880', // Warm Luxury Gold/Bronze
          light: '#DBC3A3',
          dark: '#A68962',
        },
        accent: {
          DEFAULT: '#E3F5F0', // Soft Sage/Mint Green
          dark: '#C8E8DF',
        },
        cream: {
          DEFAULT: '#FAF7F2', // Warm Soft Organic Cream
          light: '#FCFAF7',
          dark: '#F3EDE2',
        },
        wood: {
          DEFAULT: '#5D3E21', // Rich Wood/Bronze Brown
          dark: '#3D2814',
        },
        charcoal: '#2D2D2D',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(28, 63, 36, 0.05), 0 2px 10px -1px rgba(28, 63, 36, 0.03)',
        'premium-hover': '0 10px 30px -4px rgba(28, 63, 36, 0.08), 0 4px 15px -2px rgba(28, 63, 36, 0.04)',
      }
    },
  },
  plugins: [],
}
