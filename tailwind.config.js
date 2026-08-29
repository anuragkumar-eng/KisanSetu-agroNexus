/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        brand: {
          green: '#16a34a',
          light: '#f0fdf4',
          yellow: '#fef08a',
          orange: '#fb923c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 6px 0 rgba(0,0,0,0.08)',
        'card-md': '0 4px 16px 0 rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
