/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        tabPulse: {
          '0%, 100%': { background: '#fff' },
          '50%': { background: '#ffedd5' },
        },
      },
      animation: {
        fadeIn: 'fadeIn .35s',
        tabPulse: 'tabPulse 1.2s infinite',
      },
    },
  },
  plugins: [],
};
