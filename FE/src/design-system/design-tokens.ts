/**
 * 🎨 Supply Chain Traceability Design Tokens
 * Scalable UI Constants for modern enterprise SaaS.
 * Reference: Vercel, Linear, Stripe and impeccably clean dark-mode-first aesthetic.
 */

export const colors = {
  // Brand / Primary accents
  brand: {
    light: '#18181b', // Zinc-900 (Charcoal) for light mode
    dark: '#ffffff',  // Pure white for dark mode
    accent: '#4f46e5', // Deep Indigo (used sparingly for critical focus)
    accentHover: '#4338ca',
  },

  // Muted Zinc neutral scale
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b', // Pure deep dark background
  },

  // Logistics & Supply Chain Domain Status Colors
  status: {
    created: {
      light: '#71717a', // Zinc-500
      dark: '#a1a1aa',  // Zinc-400
      bgLight: '#f4f4f5',
      bgDark: '#27272a',
    },
    inTransit: {
      light: '#2563eb', // Blue-600
      dark: '#60a5fa',  // Blue-400
      bgLight: '#eff6ff',
      bgDark: '#1e3a8a/30',
    },
    received: {
      light: '#059669', // Emerald-600
      dark: '#34d399',  // Emerald-400
      bgLight: '#ecfdf5',
      bgDark: '#064e3b/30',
    },
    sold: {
      light: '#7c3aed', // Violet-600
      dark: '#a78bfa',  // Violet-400
      bgLight: '#f5f3ff',
      bgDark: '#2e1065/30',
    },
    discarded: {
      light: '#dc2626', // Red-600
      dark: '#f87171',  // Red-400
      bgLight: '#fef2f2',
      bgDark: '#7f1d1d/30',
    },
    lost: {
      light: '#ea580c', // Orange-600
      dark: '#fb923c',  // Orange-400
      bgLight: '#fff7ed',
      bgDark: '#7c2d12/30',
    },
  },

  // Incident Priority Colors
  priority: {
    low: {
      text: '#71717a',
      bg: '#f4f4f5',
      border: '#e4e4e7',
    },
    medium: {
      text: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe/40',
    },
    high: {
      text: '#ea580c',
      bg: '#fff7ed',
      border: '#fed7aa/40',
    },
    critical: {
      text: '#dc2626',
      bg: '#fef2f2',
      border: '#fca5a5/40',
    },
  },
};

export const spacing = {
  gridGap: '24px',          // gap-6: Major sections / widgets
  formGap: '16px',          // gap-4: Input fields inside forms
  cardPadding: '24px',      // p-6: Inside panel / card container
  pageMargin: '24px',       // space-y-6: Vertical section gaps
  tableCellPadding: '12px 16px', // py-3 px-4: Balanced table rows
  sectionGap: '32px',       // mb-8: Header down to data boundary
};

export const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",
  scale: {
    h1: {
      fontSize: '24px',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '16px',
      fontWeight: '500',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0',
    },
    body: {
      fontSize: '13px',
      lineHeight: '1.6',
    },
    metadata: {
      fontSize: '10px',
      fontWeight: '600',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    monoCode: {
      fontSize: '12px',
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontWeight: '500',
    },
  },
};

export const radius = {
  button: '6px', // rounded-md
  input: '6px',  // rounded-md
  card: '8px',   // rounded-lg
  badge: '4px',  // rounded
  avatar: '9999px', // rounded-full
};

export const elevation = {
  // Ultra-subtle borders with soft ambient drop shadow
  light: {
    border: '1px solid rgba(228, 228, 231, 0.5)', // border-zinc-200/50
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
  },
  dark: {
    border: '1px solid rgba(39, 39, 42, 0.4)', // border-zinc-800/40
    shadow: '0 0 0 1px rgba(0, 0, 0, 0.8), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  },
};

export const motion = {
  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  duration: '150ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};
