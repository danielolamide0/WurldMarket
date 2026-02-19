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
        // Primary olive green
        primary: {
          DEFAULT: '#636B2F',
          light: '#BAC095',
          dark: '#3D4127',
        },
        // Accent colors
        terracotta: {
          DEFAULT: '#636B2F',
          light: '#BAC095',
          dark: '#3D4127',
        },
        forest: {
          DEFAULT: '#636B2F',
          light: '#BAC095',
          dark: '#3D4127',
        },
        cream: '#FFFFFF',
        sand: '#BAC095',
        brown: '#3D4127',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
