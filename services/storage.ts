import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loan, Payment, NotificationSettings } from '../types';

const KEYS = {
  LOANS: 'emi_tracker_loans',
  PAYMENTS: 'emi_tracker_payments',
  NOTIFICATION_SETTINGS: 'emi_tracker_notification_settings',
};

// ─── DEFAULT SETTINGS ───────────────────────────────────────────────────────
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dayBeforeMorning: '09:00',
  dayBeforeAfternoon: '16:00',
  dueDateMorning: '09:00',
  dueDateEvening: '17:00',
};

// ─── LOANS ───────────────────────────────────────────────────────────────────
export async function getLoans(): Promise<Loan[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LOANS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveLoan(loan: Loan): Promise<void> {
  const loans = await getLoans();
  const idx = loans.findIndex((l) => l.id === loan.id);
  if (idx >= 0) {
    loans[idx] = loan;
  } else {
    loans.push(loan);
  }
  await AsyncStorage.setItem(KEYS.LOANS, JSON.stringify(loans));
}

export async function deleteLoan(loanId: string): Promise<void> {
  const loans = await getLoans();
  const updated = loans.filter((l) => l.id !== loanId);
  await AsyncStorage.setItem(KEYS.LOANS, JSON.stringify(updated));
  // Also delete related payments
  const payments = await getPayments();
  const filteredPayments = payments.filter((p) => p.loanId !== loanId);
  await AsyncStorage.setItem(KEYS.PAYMENTS, JSON.stringify(filteredPayments));
}

export async function updateLoanStatus(
  loanId: string,
  status: Loan['status']
): Promise<void> {
  const loans = await getLoans();
  const idx = loans.findIndex((l) => l.id === loanId);
  if (idx >= 0) {
    loans[idx].status = status;
    await AsyncStorage.setItem(KEYS.LOANS, JSON.stringify(loans));
  }
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export async function getPayments(): Promise<Payment[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PAYMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getPaymentsForLoan(loanId: string): Promise<Payment[]> {
  const all = await getPayments();
  return all.filter((p) => p.loanId === loanId);
}

export async function savePayment(payment: Payment): Promise<void> {
  const payments = await getPayments();
  payments.push(payment);
  await AsyncStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
}

// ─── NOTIFICATION SETTINGS ───────────────────────────────────────────────────
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    return raw ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) } : DEFAULT_NOTIFICATION_SETTINGS;
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
}
