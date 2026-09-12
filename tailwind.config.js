/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-app': 'var(--bg-app)',
        'bg-card': 'var(--bg-card)',
        'bg-muted': 'var(--bg-muted)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent-terracotta': 'var(--accent-terracotta)',
        'accent-sand': 'var(--accent-sand)',
        'border-subtle': 'var(--border-subtle)',
        terracotta: {
          DEFAULT: '#D97757',
          dark: '#E07A5F',
        },
        sand: {
          DEFAULT: '#C4A482',
          dark: '#8C7762',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Charter', 'Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
