import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/layouts/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/views/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-bg': 'var(--accent-bg)',
        'accent-border': 'var(--accent-border)',
        'accent-text': 'var(--accent-text)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        warning: 'var(--warning)',
        'warning-text': 'var(--warning-text)',
        danger: 'var(--danger)',
        'surface-2': 'var(--surface-2)',
        'surface-tint': 'var(--surface-tint)',
        border: 'var(--border)',
        'text-muted': 'var(--text)',
        'text-heading': 'var(--text-h)',
        surface: 'var(--bg)',
      },
      fontFamily: {
        sans: 'var(--sans)',
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
    },
  },
  plugins: [],
} satisfies Config
