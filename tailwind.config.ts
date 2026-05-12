import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1a6b3c',
          dark: '#145530',
          light: '#e8f5ee',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#f5e6c0',
          dark: '#a07830',
        },
        eman: {
          red: '#b22222',
          green: '#1a6b3c',
          gold: '#c9a84c',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
