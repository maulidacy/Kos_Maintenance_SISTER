import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'bg-soft-pulse': {
          '0%, 100%': {
            transform: 'scale(1) translate3d(0,0,0)',
          },
          '50%': {
            transform: 'scale(1.05) translate3d(-8px, 6px, 0)',
          },
        },
      },
      animation: {
        'bg-soft-pulse': 'bg-soft-pulse 26s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
