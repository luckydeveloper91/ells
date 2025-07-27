/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.3)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(1)' },
        },
        pull: {
          '0%': { transform: 'rotate(0deg) translateY(0)' },
          '30%': { transform: 'rotate(5deg) translateY(5px)' },
          '60%': { transform: 'rotate(-5deg) translateY(10px)' },
          '100%': { transform: 'rotate(0deg) translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        galaxyMove: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        blink: {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 2.5s ease-in-out infinite',
        pull: 'pull 0.4s ease',
        fadeIn: 'fadeIn 0.4s ease-out',
        slideUp: 'slideUp 0.4s ease-out',
        galaxy: 'galaxyMove 15s linear infinite',
        blink: 'blink 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
