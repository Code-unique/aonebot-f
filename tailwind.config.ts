import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#1a1a1a',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        popover: {
          DEFAULT: '#f9fafb',
          foreground: '#1a1a1a',
        },
        primary: {
          DEFAULT: '#012169',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          foreground: '#1a1a1a',
        },
        muted: {
          DEFAULT: '#f5f5f5',
          foreground: '#6b7280',
        },
        accent: {
          DEFAULT: '#ff6b00',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: '#e5e7eb',
        input: '#d1d5db',
        ring: '#cbd5e1',
        chart: {
          '1': '#2563eb',
          '2': '#10b981',
          '3': '#f97316',
          '4': '#ec4899',
          '5': '#8b5cf6',
        },
        sidebar: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
          primary: '#012169',
          'primary-foreground': '#ffffff',
          accent: '#ff6b00',
          'accent-foreground': '#ffffff',
          border: '#e5e7eb',
          ring: '#cbd5e1',
        },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
