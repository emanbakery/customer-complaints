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
          DEFAULT: '#0F4F34',
          dark: '#082F22',
          light: '#E8F3EC',
        },
        gold: {
          DEFAULT: '#C89533',
          light: '#F4D982',
          dark: '#7B4A18',
        },
        eman: {
          red: '#9F1D16',
          green: '#0F4F34',
          gold: '#C89533',
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
