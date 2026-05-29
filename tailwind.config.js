/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  plugins: [],
  theme: {
    extend: {
      backgroundImage: {
        'radial-purple': 'radial-gradient(circle at top, rgba(168, 85, 247, 0.18), transparent 55%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(168, 85, 247, 0.18), 0 12px 40px rgba(124, 58, 237, 0.22)',
      },
      colors: {
        background: 'var(--background)',
        border: 'var(--border)',
        card: 'var(--card)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        popover: 'var(--popover)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        ring: 'var(--ring)',
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
      },
    },
  },
};
