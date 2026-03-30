import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8faf2',
          100: '#c6f0dc',
          500: '#45C588',
          600: '#2fa96e',
          700: '#1d8a54',
        },
        surface: {
          DEFAULT: '#1C1C1E',
          2: '#2C2C2E',
          3: '#3A3A3C',
        },
        accent: {
          orange: '#FF6F43',
          green: '#45C588',
          blue: '#1894E0',
          yellow: '#FFD217',
          purple: '#C7B1F2',
          pink: '#FF8094',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
