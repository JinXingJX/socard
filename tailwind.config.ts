import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './*.{ts,tsx}', './components/**/*.{ts,tsx}', './providers/**/*.{ts,tsx}', './services/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        'card-title': ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
