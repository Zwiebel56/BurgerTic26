/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0d0f12',
        neon: { pink: '#ff2a5f', cyan: '#00f2fe' },
      },
      boxShadow: {
        'glow-pink': '0 0 24px rgba(255, 42, 95, 0.35)',
        'glow-cyan': '0 0 24px rgba(0, 242, 254, 0.30)',
      },
    },
  },
  plugins: [],
};
