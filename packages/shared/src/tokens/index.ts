export const colors = {
  // Brand
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Neutral
  background: '#F8F9FC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Semantic states
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Order status colors
  status: {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    preparing: '#8B5CF6',
    ready: '#10B981',
    delivered: '#64748B',
    cancelled: '#EF4444',
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

export const typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Font weights
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const

// Règles de layout / grille du design system.
// - maxContentWidth : largeur max du contenu, centré sur grand écran (lecture confortable)
// - gutter : espacement standard entre colonnes / cartes
// - breakpoints : seuils responsives (pour adapter le nombre de colonnes)
export const layout = {
  maxContentWidth: 1120,
  gutter: spacing.lg,
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
  },
} as const

/**
 * Nombre de colonnes recommandé selon la largeur disponible (grille responsive).
 * Sert aux grilles de cartes (KPIs, etc.) pour rester lisibles sur toutes tailles.
 */
export function gridColumns(width: number): number {
  if (width >= layout.breakpoints.lg) return 4
  if (width >= layout.breakpoints.md) return 3
  if (width >= layout.breakpoints.sm) return 2
  return 1
}
