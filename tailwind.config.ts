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
        // New primary blue (matching logo)
        primary: {
          DEFAULT: '#1E4D8C',
          light: '#2E6AB8',
          dark: '#153A6B',
        },
        // Keep terracotta for accents/legacy
        terracotta: {
          DEFAULT: '#E85D04',
          light: '#F28A3D',
          dark: '#B84803',
        },
        forest: {
          DEFAULT: '#2D6A4F',
          light: '#40916C',
          dark: '#1B4332',
        },
        cream: '#FDF8F3',
        sand: '#E6DCD2',
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
