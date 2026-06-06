// Design tokens for EMI Tracker

export const Colors = {
  // Clean White Backgrounds
  bg: '#FFFFFF',
  bgCard: '#F8FAFC',
  bgCard2: '#F1F5F9',
  bgInput: '#F1F5F9',
  bgModal: '#FFFFFF',

  // Vibrant Blue Accents
  primary: '#2563EB', // Blue for buttons
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  primaryAlpha: 'rgba(37, 99, 235, 0.15)',

  secondary: '#0EA5E9',
  secondaryAlpha: 'rgba(14, 165, 233, 0.15)',

  // Status
  success: '#10B981',
  successAlpha: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningAlpha: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerAlpha: 'rgba(239, 68, 68, 0.15)',

  // Dark Text for Light Theme
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  // Subtle Borders
  border: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.15)',

  // Categorical Colors (Slightly darkened for light mode contrast)
  loanHome: '#0284C7',
  loanBike: '#059669',
  loanCar: '#7C3AED',
  loanPersonal: '#D97706',
  loanEducation: '#DB2777',
  loanOther: '#475569',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LoanTypeColors: Record<string, string> = {
  Home: Colors.loanHome,
  Bike: Colors.loanBike,
  Car: Colors.loanCar,
  Personal: Colors.loanPersonal,
  Education: Colors.loanEducation,
  Other: Colors.loanOther,
};

export const LoanTypeIcons: Record<string, string> = {
  Home: 'home',
  Bike: 'directions-bike',
  Car: 'directions-car',
  Personal: 'person',
  Education: 'school',
  Other: 'more-horiz',
};
