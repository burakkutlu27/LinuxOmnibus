/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './app.js',
    './tracks.js',
    './content.js',
    './content-more.js',
    './encyclopedia.js',
    './encyclopedia-more.js',
    './encyclopedia-devops.js',
    './kali-arsenal.js',
    './kali-deep.js',
    './interview.js'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'term-bg': 'var(--term-bg)',
        'card-dark': 'var(--card-bg)',
        'card-border': 'var(--card-border)',
        'term-green': '#34D399',
        'term-cyan': '#22D3EE',
        'term-amber': '#FBBF24',
        'term-red': '#F87171',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      }
    }
  },
  plugins: []
};
