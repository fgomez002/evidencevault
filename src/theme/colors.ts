/**
 * EvidenceVault color tokens.
 *
 * Tone: calm, serious, trustworthy. Dark by default. Red is reserved exclusively
 * for the panic flow so it never reads as "alarm" anywhere else in the product.
 */

export const palette = {
  // Backgrounds
  bg: '#0B1220',
  surface: '#16202E',
  surfaceElevated: '#1E2A3A',
  surfacePressed: '#243245',

  // Borders / dividers
  border: '#26344A',
  borderStrong: '#33455F',

  // Text
  text: '#E8EEF6',
  textMuted: '#9FB0C6',
  textFaint: '#6B7C94',
  textInverse: '#0B1220',

  // Trust accent (teal/indigo blend) — primary actions, links, active states
  accent: '#3DD6C4',
  accentDim: '#1F6E66',
  accentText: '#0B1220',

  indigo: '#6C8CFF',

  // Semantic
  success: '#3DD68B',
  warning: '#F2C14E',
  // Danger reserved for panic + destructive only
  danger: '#FF5A5F',
  dangerDim: '#7A2E30',

  // Category accent chips
  categoryHarassment: '#FF8A5C',
  categorySuspicious: '#F2C14E',
  categoryThreat: '#FF5A5F',
  categoryProperty: '#6C8CFF',
  categoryWorkplace: '#3DD6C4',
  categoryOnline: '#B084FF',
  categoryOther: '#9FB0C6',
} as const;

export type Palette = typeof palette;
