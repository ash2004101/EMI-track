// TypeScript interfaces for EMI Tracker

export type LoanType = string;
export type LoanStatus = 'Pending' | 'Paid' | 'Overdue';

export interface Loan {
  id: string;
  name: string;
  type: LoanType;
  emiAmount: number;
  totalDues: number;
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  status: LoanStatus;
  createdAt: string; // ISO datetime
}

export interface Payment {
  id: string;
  loanId: string;
  paidAt: string; // ISO datetime
  amount: number;
  month: string; // YYYY-MM
}

export interface NotificationSettings {
  dayBeforeMorning: string;    // "HH:MM" format, default "09:00"
  dayBeforeAfternoon: string;  // "HH:MM" format, default "16:00"
  dueDateMorning: string;      // "HH:MM" format, default "09:00"
  dueDateEvening: string;      // "HH:MM" format, default "17:00"
}

export type NotificationSuffix = 'd1_morning' | 'd1_afternoon' | 'd0_morning' | 'd0_evening';
