/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1A73E8', // Zoho blue variant
          hover: '#1557B0',
          light: '#E8F0FE',
        },
        surface: {
          DEFAULT: '#F9F9F9',
          white: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#E74C3C', // Alerts
          light: '#FADBD8',
        },
        text: {
          primary: '#212121',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#D1D5DB',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
