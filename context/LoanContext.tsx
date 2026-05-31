import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { Loan, Payment, NotificationSettings } from '../types';
import {
  getLoans,
  saveLoan,
  deleteLoan as storageDeleteLoan,
  updateLoanStatus,
  getPaymentsForLoan,
  savePayment,
  getNotificationSettings,
  saveNotificationSettings,
} from '../services/storage';
import {
  scheduleNotificationsForLoan,
  cancelNotificationsForLoan,
  rescheduleNotificationsForLoan,
  rescheduleAllNotifications,
} from '../services/notifications';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface LoanState {
  loans: Loan[];
  payments: Record<string, Payment[]>;
  notificationSettings: NotificationSettings;
  loading: boolean;
}

type Action =
  | { type: 'SET_LOANS'; loans: Loan[] }
  | { type: 'SET_PAYMENTS'; loanId: string; payments: Payment[] }
  | { type: 'ADD_LOAN'; loan: Loan }
  | { type: 'UPDATE_LOAN'; loan: Loan }
  | { type: 'DELETE_LOAN'; loanId: string }
  | { type: 'UPDATE_STATUS'; loanId: string; status: Loan['status'] }
  | { type: 'ADD_PAYMENT'; payment: Payment }
  | { type: 'SET_NOTIFICATION_SETTINGS'; settings: NotificationSettings }
  | { type: 'SET_LOADING'; loading: boolean };

interface LoanContextValue extends LoanState {
  addLoan: (loan: Loan) => Promise<void>;
  updateLoan: (loan: Loan) => Promise<void>;
  deleteLoan: (loanId: string) => Promise<void>;
  markAsPaid: (loanId: string) => Promise<void>;
  loadPaymentsForLoan: (loanId: string) => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  refreshLoans: () => Promise<void>;
  getLoanById: (id: string) => Loan | undefined;
  getUpcomingCount: () => number;
  getTotalMonthlyEMI: () => number;
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────
function reducer(state: LoanState, action: Action): LoanState {
  switch (action.type) {
    case 'SET_LOANS':
      return { ...state, loans: action.loans, loading: false };
    case 'SET_PAYMENTS':
      return {
        ...state,
        payments: { ...state.payments, [action.loanId]: action.payments },
      };
    case 'ADD_LOAN':
      return { ...state, loans: [...state.loans, action.loan] };
    case 'UPDATE_LOAN':
      return {
        ...state,
        loans: state.loans.map((l) => (l.id === action.loan.id ? action.loan : l)),
      };
    case 'DELETE_LOAN':
      return {
        ...state,
        loans: state.loans.filter((l) => l.id !== action.loanId),
      };
    case 'UPDATE_STATUS':
      return {
        ...state,
        loans: state.loans.map((l) =>
          l.id === action.loanId ? { ...l, status: action.status } : l
        ),
      };
    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: {
          ...state.payments,
          [action.payment.loanId]: [
            ...(state.payments[action.payment.loanId] || []),
            action.payment,
          ],
        },
      };
    case 'SET_NOTIFICATION_SETTINGS':
      return { ...state, notificationSettings: action.settings };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initialState: LoanState = {
  loans: [],
  payments: {},
  notificationSettings: {
    dayBeforeMorning: '09:00',
    dayBeforeAfternoon: '16:00',
    dueDateMorning: '09:00',
    dueDateEvening: '17:00',
  },
  loading: true,
};

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const LoanContext = createContext<LoanContextValue | undefined>(undefined);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshLoans = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    const [loans, settings] = await Promise.all([
      getLoans(),
      getNotificationSettings(),
    ]);
    // Auto-update overdue status
    const today = new Date().toISOString().split('T')[0];
    const updatedLoans = loans.map((loan) => {
      if (loan.status === 'Pending' && loan.dueDate < today) {
        return { ...loan, status: 'Overdue' as const };
      }
      return loan;
    });
    dispatch({ type: 'SET_LOANS', loans: updatedLoans });
    dispatch({ type: 'SET_NOTIFICATION_SETTINGS', settings });
  }, []);

  useEffect(() => {
    refreshLoans();
  }, [refreshLoans]);

  const addLoan = useCallback(
    async (loan: Loan) => {
      await saveLoan(loan);
      dispatch({ type: 'ADD_LOAN', loan });
      await scheduleNotificationsForLoan(loan, state.notificationSettings);
    },
    [state.notificationSettings]
  );

  const updateLoan = useCallback(
    async (loan: Loan) => {
      await saveLoan(loan);
      dispatch({ type: 'UPDATE_LOAN', loan });
      await rescheduleNotificationsForLoan(loan, state.notificationSettings);
    },
    [state.notificationSettings]
  );

  const deleteLoan = useCallback(async (loanId: string) => {
    await storageDeleteLoan(loanId);
    await cancelNotificationsForLoan(loanId);
    dispatch({ type: 'DELETE_LOAN', loanId });
  }, []);

  const markAsPaid = useCallback(async (loanId: string) => {
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan) return;

    // Save payment record
    const now = new Date();
    const payment: Payment = {
      id: `${loanId}_${Date.now()}`,
      loanId,
      paidAt: now.toISOString(),
      amount: loan.emiAmount,
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    };
    await savePayment(payment);
    dispatch({ type: 'ADD_PAYMENT', payment });

    // Check if fully paid based on totalDues
    const existingPayments = state.payments[loanId] || [];
    const totalPaymentsMade = existingPayments.length + 1;

    if (totalPaymentsMade >= loan.totalDues) {
      // Loan fully paid
      await updateLoanStatus(loanId, 'Paid');
      dispatch({ type: 'UPDATE_STATUS', loanId, status: 'Paid' });
      await cancelNotificationsForLoan(loanId);
    } else {
      // Advance due date by 1 month
      const [year, month, day] = loan.dueDate.split('-').map(Number);
      // JS Date month is 0-indexed. Passing 'month' advances it by 1 month
      const nextDueDate = new Date(year, month, day);
      const nextDueDateStr = nextDueDate.toISOString().split('T')[0];
      
      const updatedLoan = { ...loan, dueDate: nextDueDateStr, status: 'Pending' as const };
      await saveLoan(updatedLoan);
      dispatch({ type: 'UPDATE_LOAN', loan: updatedLoan });
      await rescheduleNotificationsForLoan(updatedLoan, state.notificationSettings);
    }
  }, [state.loans, state.payments, state.notificationSettings]);

  const loadPaymentsForLoan = useCallback(async (loanId: string) => {
    const payments = await getPaymentsForLoan(loanId);
    dispatch({ type: 'SET_PAYMENTS', loanId, payments });
  }, []);

  const updateNotificationSettings = useCallback(
    async (settings: NotificationSettings) => {
      await saveNotificationSettings(settings);
      dispatch({ type: 'SET_NOTIFICATION_SETTINGS', settings });
      // Reschedule all non-paid loans
      const pendingLoans = state.loans.filter((l) => l.status !== 'Paid');
      await rescheduleAllNotifications(pendingLoans, settings);
    },
    [state.loans]
  );

  const getLoanById = useCallback(
    (id: string) => state.loans.find((l) => l.id === id),
    [state.loans]
  );

  const getUpcomingCount = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    return state.loans.filter(
      (l) => l.status === 'Pending' && l.dueDate >= today && l.dueDate <= sevenDaysLater
    ).length;
  }, [state.loans]);

  const getTotalMonthlyEMI = useCallback(
    () => state.loans.reduce((sum, l) => sum + l.emiAmount, 0),
    [state.loans]
  );

  return (
    <LoanContext.Provider
      value={{
        ...state,
        addLoan,
        updateLoan,
        deleteLoan,
        markAsPaid,
        loadPaymentsForLoan,
        updateNotificationSettings,
        refreshLoans,
        getLoanById,
        getUpcomingCount,
        getTotalMonthlyEMI,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanContext(): LoanContextValue {
  const ctx = useContext(LoanContext);
  if (!ctx) throw new Error('useLoanContext must be used within LoanProvider');
  return ctx;
}
