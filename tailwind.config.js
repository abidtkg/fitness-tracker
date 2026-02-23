/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0f0d',
          secondary: '#111a16',
          card: 'rgba(17, 26, 22, 0.8)',
        },
        green: {
          50: '#e8f5e9',
          500: '#00E676',
          600: '#00C853',
        },
        border: {
          DEFAULT: 'rgba(0, 230, 118, 0.12)',
          hover: 'rgba(0, 230, 118, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
