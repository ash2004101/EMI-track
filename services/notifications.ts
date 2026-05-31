import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Loan, NotificationSettings } from '../types';
import { DEFAULT_NOTIFICATION_SETTINGS } from './storage';

// ─── PERMISSION ──────────────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('emi-reminders', {
      name: 'EMI Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
      sound: 'default',
    });
  }

  return true;
}

// ─── NOTIFICATION HANDLER ────────────────────────────────────────────────────
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function buildTriggerDate(dueDateStr: string, dayOffset: number, timeStr: string): Date | null {
  const { hours, minutes } = parseTime(timeStr);
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day + dayOffset, hours, minutes, 0, 0);
  if (target.getTime() <= Date.now()) return null;
  return target;
}

function getNotificationId(loanId: string, suffix: string): string {
  return `${loanId}_${suffix}`;
}

// ─── SCHEDULE ────────────────────────────────────────────────────────────────
export async function scheduleNotificationsForLoan(
  loan: Loan,
  settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS
): Promise<void> {
  const { name, emiAmount, dueDate, id } = loan;
  const amountStr = new Intl.NumberFormat('en-IN').format(emiAmount);

  const notifications: { suffix: string; dayOffset: number; timeStr: string; body: string }[] = [
    {
      suffix: 'd1_morning',
      dayOffset: -1,
      timeStr: settings.dayBeforeMorning,
      body: `Reminder: Your ${name} EMI of ₹${amountStr} is due tomorrow.`,
    },
    {
      suffix: 'd1_afternoon',
      dayOffset: -1,
      timeStr: settings.dayBeforeAfternoon,
      body: `Reminder: Your ${name} EMI of ₹${amountStr} is due tomorrow.`,
    },
    {
      suffix: 'd0_morning',
      dayOffset: 0,
      timeStr: settings.dueDateMorning,
      body: `Today is the due date for your ${name} EMI of ₹${amountStr}.`,
    },
    {
      suffix: 'd0_evening',
      dayOffset: 0,
      timeStr: settings.dueDateEvening,
      body: `⚠️ Your ${name} EMI payment of ₹${amountStr} is still pending!`,
    },
  ];

  for (const n of notifications) {
    const triggerDate = buildTriggerDate(dueDate, n.dayOffset, n.timeStr);
    if (!triggerDate) continue;

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: getNotificationId(id, n.suffix),
        content: {
          title: '💰 EMI Reminder',
          body: n.body,
          sound: 'default',
          data: { loanId: id, type: n.suffix },
        },
        trigger: {
          date: triggerDate,
          channelId: 'emi-reminders',
        },
      });
    } catch (err) {
      console.warn(`Failed to schedule ${n.suffix} notification for ${name}:`, err);
    }
  }
}

export async function cancelNotificationsForLoan(loanId: string): Promise<void> {
  const suffixes = ['d1_morning', 'd1_afternoon', 'd0_morning', 'd0_evening'];
  for (const suffix of suffixes) {
    try {
      await Notifications.cancelScheduledNotificationAsync(getNotificationId(loanId, suffix));
    } catch {
      // Ignore — notification may not exist
    }
  }
}

export async function rescheduleNotificationsForLoan(
  loan: Loan,
  settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS
): Promise<void> {
  await cancelNotificationsForLoan(loan.id);
  await scheduleNotificationsForLoan(loan, settings);
}

export async function rescheduleAllNotifications(
  loans: Loan[],
  settings: NotificationSettings
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const loan of loans) {
    if (loan.status !== 'Paid') {
      await scheduleNotificationsForLoan(loan, settings);
    }
  }
}

export async function getScheduledNotificationsCount(): Promise<number> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.length;
}
