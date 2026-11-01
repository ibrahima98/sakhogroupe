/**
 * Charte SAKHO GROUP SARL (maquettes UI/UX, diapo « Palette et principes »).
 */

export const Colors = {
  background: '#F7F3E9', // fond de l'application
  sand: '#E9DEC3', // panneau sable
  emerald: '#0D3A2D', // vert émeraude
  yellow: '#FFB804', // actions
  orange: '#C46F18', // mosquée / accents
  card: '#FFFFFF', // cartes et tuiles
  text: '#0D3A2D',
  textSecondary: '#5E6B63',
  border: '#E3D8BE',
  skeleton: '#E6DDC8',
  danger: '#B3261E',
} as const;

export const Fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  arabic: 'Amiri_400Regular',
  arabicBold: 'Amiri_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;
