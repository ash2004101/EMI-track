// Design tokens for EMI Tracker

export const Colors = {
  // Backgrounds
  bg: '#05050A',
  bgCard: '#1A1A27',
  bgCard2: '#222236',
  bgInput: '#101018',
  bgModal: '#1C1C2A',

  // Accent
  primary: '#7B61FF',
  primaryLight: '#B3A6FF',
  primaryDark: '#5635FF',
  primaryAlpha: 'rgba(123, 97, 255, 0.2)',

  // Status
  success: '#00FFA3',
  successAlpha: 'rgba(0, 255, 163, 0.15)',
  warning: '#FFB800',
  warningAlpha: 'rgba(255, 184, 0, 0.15)',
  danger: '#FF3366',
  dangerAlpha: 'rgba(255, 51, 102, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#C5C5D6',
  textMuted: '#8E8EA8',
  textInverse: '#05050A',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',

  // Loan type colors (Vibrant)
  loanHome: '#33D4FF',
  loanBike: '#00FFA3',
  loanCar: '#A855F7',
  loanPersonal: '#FFB800',
  loanEducation: '#FF3366',
  loanOther: '#9CA3AF',
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
