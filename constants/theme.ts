// Design tokens for EMI Tracker

export const Colors = {
  // Backgrounds
  bg: '#0F0F1A',
  bgCard: '#1A1A2E',
  bgCard2: '#16213E',
  bgInput: '#0D0D20',
  bgModal: '#1E1E35',

  // Accent
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4F46E5',
  primaryAlpha: 'rgba(108, 99, 255, 0.15)',

  // Status
  success: '#22C55E',
  successAlpha: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningAlpha: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerAlpha: 'rgba(239, 68, 68, 0.15)',

  // Text
  textPrimary: '#F0EFFB',
  textSecondary: '#9A99B2',
  textMuted: '#5C5B75',
  textInverse: '#0F0F1A',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',

  // Loan type colors
  loanHome: '#3B82F6',
  loanBike: '#10B981',
  loanCar: '#8B5CF6',
  loanPersonal: '#F59E0B',
  loanEducation: '#EC4899',
  loanOther: '#6B7280',
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
