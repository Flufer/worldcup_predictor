// Design tokens — single source of truth for color/spacing. See docs/SCREENS.md.
export const theme = {
  color: {
    bg: '#0B1220',
    surface: '#16203A',
    surfaceAlt: '#1E2A47',
    border: '#24314F',
    primary: '#22C55E',
    primaryDark: '#16A34A',
    accent: '#FACC15',
    danger: '#EF4444',
    text: '#F8FAFC',
    muted: '#94A3B8',
  },
  radius: { sm: 10, md: 16, lg: 22, pill: 999 },
  space: (n: number) => n * 4,
  font: {
    h1: 28,
    h2: 22,
    h3: 18,
    body: 16,
    small: 13,
  },
} as const;
