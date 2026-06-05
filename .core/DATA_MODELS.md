# EMI TRACKER - DATA MODELS & SCHEMAS

This document outlines the exact TypeScript interfaces and JSON structures used to store data in the device's local database (`@react-native-async-storage/async-storage`). 

If you are building an export feature, data visualization, or complex math logic, use this document to understand exactly what the payload looks like.

---

## 💾 STORAGE KEYS
The application uses the following keys to persist JSON strings in local storage:
- `emi_tracker_loans` (Array of `Loan` objects)
- `emi_tracker_payments` (Array of `Payment` objects)
- `emi_tracker_notification_settings` (A single `NotificationSettings` object)

---

## 📊 DATA SCHEMAS

### 1. Loan Object
Represents a single EMI/Loan tracked by the user.

```typescript
export type LoanType = string; // e.g., 'Home', 'Car', 'Personal', 'Gold', 'Other'
export type LoanStatus = 'Pending' | 'Paid' | 'Overdue';

export interface Loan {
  id: string;              // UUID v4
  name: string;            // User-defined name (e.g., "HDFC Car Loan")
  type: LoanType;          // Category used for mapping Glow Colors in theme.ts
  emiAmount: number;       // The raw monthly amount in INR (e.g., 15000)
  totalDues: number;       // Total number of months/EMIs in the lifespan of the loan
  dueDate: string;         // Current active due date formatted as 'YYYY-MM-DD'
  notes?: string;          // Optional user notes
  status: LoanStatus;      // Current state (Overdue calculated dynamically vs Date.now())
  createdAt: string;       // ISO datetime string
}
```

### 2. Payment Object
Represents a single successful EMI payment transaction. Saved when the user clicks "Mark EMI as Paid".

```typescript
export interface Payment {
  id: string;              // UUID v4
  loanId: string;          // Foreign key matching Loan.id
  paidAt: string;          // ISO datetime string of the exact moment they paid
  amount: number;          // The EMI amount paid
  month: string;           // The target month of the EMI formatted as 'YYYY-MM'
}
```

### 3. Notification Settings
The global times the user has chosen to trigger their background push notifications.

```typescript
export interface NotificationSettings {
  dayBeforeMorning: string;    // 24-hour HH:mm string (e.g., '09:00')
  dayBeforeAfternoon: string;  // 24-hour HH:mm string (e.g., '14:00')
  dueDateMorning: string;      // 24-hour HH:mm string (e.g., '09:00')
  dueDateEvening: string;      // 24-hour HH:mm string (e.g., '18:00')
}
```

### 4. Notification Suffixes
Used as unique identifiers when creating trigger IDs in `expo-notifications`.
```typescript
export type NotificationSuffix = 'd1_morning' | 'd1_afternoon' | 'd0_morning' | 'd0_evening';
```
