import type { Config } from 'tailwindcss';

const tokenColor = (token: string) => `rgb(var(${token}) / <alpha-value>)`;

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      spacing: {
        13: '3.25rem',
      },
      borderColor: {
        DEFAULT: 'var(--border-default)',
        subtle: 'var(--border-subtle)',
        default: 'var(--border-default)',
        strong: 'var(--border-strong)',
        hairline: 'var(--hairline)',
        'hairline-strong': 'var(--hairline-strong)',
      },
      colors: {
        overlay: {
          1: 'var(--overlay-1)',
          2: 'var(--overlay-2)',
          3: 'var(--overlay-3)',
        },
        hairline: 'var(--hairline)',
        'hairline-strong': 'var(--hairline-strong)',
        'on-brand': 'var(--on-brand)',
        'on-tint': 'var(--on-tint)',
        'on-tint-muted': 'var(--on-tint-muted)',
        scrim: 'var(--scrim)',
        'accent-brand': 'var(--accent-brand)',
        'accent-brand-ink': 'var(--accent-brand-ink)',
        'accent-brand-tint': 'var(--accent-brand-tint)',
        'accent-info': 'var(--accent-info)',
        'accent-info-ink': 'var(--accent-info-ink)',
        'accent-info-tint': 'var(--accent-info-tint)',
        'accent-success': 'var(--accent-success)',
        'accent-success-ink': 'var(--accent-success-ink)',
        'accent-success-tint': 'var(--accent-success-tint)',
        'accent-warning': 'var(--accent-warning)',
        'accent-warning-ink': 'var(--accent-warning-ink)',
        'accent-warning-tint': 'var(--accent-warning-tint)',
        'accent-danger': 'var(--accent-danger)',
        'accent-danger-ink': 'var(--accent-danger-ink)',
        'accent-danger-tint': 'var(--accent-danger-tint)',
        'accent-play': 'var(--accent-play)',
        'accent-play-ink': 'var(--accent-play-ink)',
        'accent-play-tint': 'var(--accent-play-tint)',
        accent: tokenColor('--brand-primary-rgb'),
        'accent-muted': tokenColor('--brand-primary-deep-rgb'),
        background: tokenColor('--surface-0-rgb'),
        border: 'var(--border-default)',
        card: 'var(--surface-2)',
        foreground: 'var(--text-primary)',
        surface: {
          0: tokenColor('--surface-0-rgb'),
          1: tokenColor('--surface-1-rgb'),
          2: tokenColor('--surface-2-rgb'),
          3: tokenColor('--surface-3-rgb'),
        },
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        'border-subtle': 'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'accent-fg': 'var(--accent-fg)',
        'accent-bg': 'var(--accent-bg)',
        tone: {
          success: {
            fg: 'var(--tone-success-fg)',
            bg: 'var(--tone-success-bg)',
            border: 'var(--tone-success-border)',
          },
          warn: {
            fg: 'var(--tone-warn-fg)',
            bg: 'var(--tone-warn-bg)',
            border: 'var(--tone-warn-border)',
          },
          danger: {
            fg: 'var(--tone-danger-fg)',
            bg: 'var(--tone-danger-bg)',
            border: 'var(--tone-danger-border)',
          },
          info: {
            fg: 'var(--tone-info-fg)',
            bg: 'var(--tone-info-bg)',
            border: 'var(--tone-info-border)',
          },
        },
        brand: {
          primary: tokenColor('--brand-primary-rgb'),
          'primary-soft': tokenColor('--brand-primary-soft-rgb'),
          'primary-deep': tokenColor('--brand-primary-deep-rgb'),
          secondary: tokenColor('--brand-secondary-rgb'),
          'secondary-soft': tokenColor('--brand-secondary-soft-rgb'),
          accent: tokenColor('--brand-accent-rgb'),
          'accent-soft': tokenColor('--brand-accent-soft-rgb'),
          success: tokenColor('--brand-success-rgb'),
          danger: tokenColor('--brand-danger-rgb'),
          warning: tokenColor('--brand-warning-rgb'),
          pink: tokenColor('--brand-pink-rgb'),
          orange: tokenColor('--brand-orange-rgb'),
          indigo: tokenColor('--brand-indigo-rgb'),
        },
        xp: {
          bronze: '#C27C3C',
          silver: '#94A3B8',
          gold: '#FBBF24',
          platinum: '#67E8F9',
          legendary: '#EC4899',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        display: [
          'var(--font-display)',
          'var(--font-poppins)',
          'system-ui',
          'sans-serif',
        ],
        dyslexic: ['OpenDyslexic', 'Lexend', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': [
          'clamp(2.75rem, 6vw, 4rem)',
          { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' },
        ],
        'display-lg': [
          'clamp(2.25rem, 5vw, 3rem)',
          { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' },
        ],
        'display-md': [
          'clamp(1.75rem, 4vw, 2.25rem)',
          { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' },
        ],
      },
      boxShadow: {
        'brand-glow': '0 0 30px rgba(124, 58, 237, 0.35)',
        'brand-glow-lg': '0 0 60px rgba(124, 58, 237, 0.45)',
        'accent-glow': '0 0 25px rgba(250, 204, 21, 0.35)',
        'soft-card': '0 6px 18px -6px rgba(15, 23, 42, 0.18)',
        'pop-card': '0 18px 36px -14px rgba(124, 58, 237, 0.35)',
        bento:
          '0 2px 10px -2px rgba(15, 23, 42, 0.08), 0 1px 4px -1px rgba(15, 23, 42, 0.06)',
        'bento-hover':
          '0 12px 30px -6px rgba(15, 23, 42, 0.14), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
        'subtle-card':
          '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #FB923C 100%)',
        'modern-gradient':
          'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        'cool-gradient':
          'linear-gradient(135deg, #06B6D4 0%, #6366F1 50%, #7C3AED 100%)',
        'warm-gradient':
          'linear-gradient(135deg, #FACC15 0%, #FB923C 60%, #EC4899 100%)',
        'success-gradient': 'linear-gradient(135deg, #22C55E 0%, #06B6D4 100%)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-y': 'float-y var(--float-duration, 4s) ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        gradient: 'gradient 8s ease infinite',
        wiggle: 'wiggle 0.6s ease-in-out',
        pop: 'pop 0.22s ease-out',
        shine: 'shine 2.2s linear infinite',
        'bounce-soft': 'bounceSoft 1.6s ease-in-out infinite',
        'gradient-flow': 'gradientFlow 6s ease infinite',
        'fade-up': 'fadeUp 0.45s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.85)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-6deg)' },
          '40%': { transform: 'rotate(6deg)' },
          '60%': { transform: 'rotate(-4deg)' },
          '80%': { transform: 'rotate(4deg)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translate3d(0, 18px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
