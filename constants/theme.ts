// Design tokens for EMI Tracker

export const Colors = {
  // Deep Obsidian Backgrounds
  bg: '#000000',
  bgCard: '#111115',
  bgCard2: '#18181E',
  bgInput: '#15151A',
  bgModal: '#0F0F13',

  // Vibrant Neon Accents
  primary: '#6366F1', // Electric Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryAlpha: 'rgba(99, 102, 241, 0.15)', // Glass glow

  secondary: '#06B6D4', // Cyan
  secondaryAlpha: 'rgba(6, 182, 212, 0.15)',

  // Status
  success: '#10B981', // Emerald
  successAlpha: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B', // Amber
  warningAlpha: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444', // Rose
  dangerAlpha: 'rgba(239, 68, 68, 0.15)',

  // Crisp Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#000000',

  // Minimalist Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',

  // Categorical Neons
  loanHome: '#06B6D4',
  loanBike: '#10B981',
  loanCar: '#8B5CF6',
  loanPersonal: '#F59E0B',
  loanEducation: '#EC4899',
  loanOther: '#71717A',
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
