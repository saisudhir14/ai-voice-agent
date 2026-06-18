/** @type {import('tailwindcss').Config} */
/*
  Lattice — drop-in replacement for frontend/tailwind.config.js
  Adds Inter + JetBrains Mono, maps shadcn tokens, drops the nebula/cyan palette.
  Load fonts in index.html:
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
*/
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Lattice surface scale (for operator-console chrome)
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        // ===== Marketing semantic tokens (light) =====
        ink: {
          DEFAULT: 'var(--mk-ink)',
          2: 'var(--mk-ink-2)',
          3: 'var(--mk-ink-3)',
          on: 'var(--mk-ink-on)',
          surface: 'var(--mk-ink-surface)',
        },
        paper: {
          DEFAULT: 'var(--mk-paper)',
          2: 'var(--mk-paper-2)',
          3: 'var(--mk-paper-3)',
        },
        line: {
          DEFAULT: 'var(--mk-line)',
          2: 'var(--mk-line-2)',
        },
        brand: {
          DEFAULT: 'var(--mk-brand)',
          ink: 'var(--mk-brand-ink)',
          tint: 'var(--mk-brand-tint)',
        },
      },
      maxWidth: {
        container: 'var(--mk-container)',
      },
      fontSize: {
        // Eyebrow / overline
        eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.08em', fontWeight: '600' }],
        // Display scale (Inter Tight, tight negative tracking)
        'display-sm': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.022em', fontWeight: '600' }],
        'display-lg': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.026em', fontWeight: '600' }],
        'display-xl': ['3.75rem', { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-2xl': ['4.75rem', { lineHeight: '0.98', letterSpacing: '-0.034em', fontWeight: '600' }],
      },
      borderRadius: {
        lg: '10px',
        md: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)',
        card: '16px',
        xl2: '20px',
        pill: '9999px',
      },
      boxShadow: {
        'mk-xs': 'var(--mk-shadow-xs)',
        'mk-sm': 'var(--mk-shadow-sm)',
        'mk-md': 'var(--mk-shadow-md)',
        'mk-lg': 'var(--mk-shadow-lg)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter Tight', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'l-sm': 'var(--shadow-sm)',
        'l-md': 'var(--shadow-md)',
        'l-lg': 'var(--shadow-lg)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'pulse-ring': { '0%': { transform: 'scale(0.9)', opacity: '0.7' }, '100%': { transform: 'scale(1.8)', opacity: '0' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-ring': 'pulse-ring 1.8s infinite',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
