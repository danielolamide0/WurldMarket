import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary orange
        primary: {
          DEFAULT: '#FF5F1F',
          light: '#FF8347',
          dark: '#CC4C19',
        },
        // Accent green (neon)
        accent: {
          DEFAULT: '#39FF14',
          light: '#6FFF4D',
          dark: '#2DCC10',
        },
        // Legacy colors kept for compatibility
        terracotta: {
          DEFAULT: '#FF5F1F',
          light: '#FF8347',
          dark: '#CC4C19',
        },
        forest: {
          DEFAULT: '#39FF14',
          light: '#6FFF4D',
          dark: '#2DCC10',
        },
        cream: '#F5F5F5',
        sand: '#E8E8E8',
        brown: '#6B4423',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
