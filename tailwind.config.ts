import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        border: '#e5e7eb',
      },
      fontSize: {
        xs: ['11px', '16px'],
        sm: ['13px', '20px'],
        base: ['14px', '22px'],
      },
    },
  },
  plugins: [],
};

export default config;
