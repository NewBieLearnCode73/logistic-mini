import type { Config } from 'tailwindcss';

/**
 * 🚀 Extended Tailwind Configuration mapping to the design system.
 * This config can be imported directly or spread into the root tailwind.config.ts
 */
export const tailwindConfigExtension: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-background)',
        surface: 'var(--bg-surface)',
        card: 'var(--bg-card)',
        popover: 'var(--bg-popover)',
        muted: {
          DEFAULT: 'var(--bg-muted)',
          foreground: 'var(--text-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        border: {
          DEFAULT: 'var(--border-primary)',
          muted: 'var(--border-muted)',
        },
        accent: {
          DEFAULT: 'var(--brand-accent)',
          hover: 'var(--brand-accent-hover)',
          glow: 'var(--brand-accent-glow)',
        },
        // Domain status colors
        status: {
          created: {
            text: 'var(--status-created-text)',
            bg: 'var(--status-created-bg)',
            dot: 'var(--status-created-dot)',
          },
          intransit: {
            text: 'var(--status-intransit-text)',
            bg: 'var(--status-intransit-bg)',
            dot: 'var(--status-intransit-dot)',
          },
          received: {
            text: 'var(--status-received-text)',
            bg: 'var(--status-received-bg)',
            dot: 'var(--status-received-dot)',
          },
          sold: {
            text: 'var(--status-sold-text)',
            bg: 'var(--status-sold-bg)',
            dot: 'var(--status-sold-dot)',
          },
          discarded: {
            text: 'var(--status-discarded-text)',
            bg: 'var(--status-discarded-bg)',
            dot: 'var(--status-discarded-dot)',
          },
          lost: {
            text: 'var(--status-lost-text)',
            bg: 'var(--status-lost-bg)',
            dot: 'var(--status-lost-dot)',
          },
        },
      },
      spacing: {
        'grid-gap': '24px',          // gap-6: Major sections / widgets
        'form-gap': '16px',          // gap-4: Input fields inside forms
        'card-pad': '24px',          // p-6: Inside panel / card container
        'page-margin': '24px',       // space-y-6: Vertical section gaps
        'section-gap': '32px',       // mb-8: Header down to data boundary
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        '3xs': ['10px', '14px'],
      },
      boxShadow: {
        'saas-sm': 'var(--shadow-sm)',
        'saas-md': 'var(--saas-md)',
        'saas-lg': 'var(--saas-lg)',
      },
      backdropBlur: {
        'saas-glass': 'var(--glass-blur)',
      },
    },
  },
};

export default tailwindConfigExtension;
