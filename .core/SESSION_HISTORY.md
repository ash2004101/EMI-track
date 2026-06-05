# EMI TRACKER - AGENT SESSION & CHANGE HISTORY

This document records the major structural changes, feature implementations, bugs encountered, and decisions made by the AI Agent throughout the lifecycle of the project. Future agents MUST read this to understand project constraints and avoid repeating past mistakes.

---

## 🕒 VERSION CONTROL (GIT)
- **Line-by-Line Tracking:** As of today, the project is officially tracked via **Git version control**. 
- While this `.Core` documentation tracks high-level architectural decisions and bug fixes, **Git** is the absolute source of truth for exact line-by-line code changes. If a future agent or developer needs to "undo" a broken feature or see exactly what lines of code were modified on a specific date, they should use `git log` and `git diff`.

---

## 🏗️ 1. ARCHITECTURAL FOUNDATION
- **Framework & Routing:** Initialized using Expo Router (SDK 56). Established the `(tabs)` structure for Dashboard, Analytics, and Settings, alongside hidden modal routes (`add-loan`, `loan/[id]`).
- **Styling Paradigm:** Enforced Vanilla React Native `StyleSheet`. Explicitly rejected TailwindCSS to maintain high-performance native rendering. Created `constants/theme.ts` as the single source of truth for all `Colors`, `Spacing`, and `Radius` tokens.
- **State Management:** Built `LoanContext.tsx` using the React Context API to manage all global states. Data persistence was wired up entirely using `@react-native-async-storage/async-storage` (`services/storage.ts`), deliberately avoiding complex ORMs like SQLite for lightweight portability.

## 🚀 2. FEATURE IMPLEMENTATIONS (Agent Contributions)

### **Dashboard & UI Overhaul**
- Built the "Floating Glass Tab Bar" using `Math.max(insets.bottom, 16) + 16` inside `(tabs)/_layout.tsx` to prevent clipping with Android system gestures.
- Created `AnimatedTouchable.tsx` using `react-native-reanimated` to give every button and card an Apple-style 60fps physics-based bounce effect.
- Engineered the `LoanCard.tsx` with dynamic badge coloring and progress bars that automatically calculate completion based on `paymentsCount / totalDues`.

### **Settings & Form Controls**
- Built an entirely custom, native-feeling `<CustomTimePickerModal>` in `settings.tsx` to handle 24-hour time selection (bypassing the need to install external messy picker libraries).
- Locked the Save buttons to the bottom of the Settings and Add Loan screens using Flexbox (`justifyContent: 'space-between'`) to eliminate unnecessary scrolling.

### **Push Notification Engine**
- Integrated `expo-notifications` (`services/notifications.ts`).
- Created a robust scheduling array that automatically queues exactly 4 local reminders for every active loan based on the user's custom settings:
  1. `d1_morning` (Day before)
  2. `d1_afternoon` (Day before)
  3. `d0_morning` (Due date morning)
  4. `d0_evening` (Due date evening warning)
- Built logic into `LoanContext.tsx` so that calling `markAsPaid()` automatically shifts the due date by 1 month and immediately reschedules the 4 push notifications.

---

## 🐛 3. CRITICAL BUGS FIRED & FIXED (DO NOT REPEAT)

### 🚨 Bug 1: Metro Bundler / Windows `ENOENT` Crash
- **Symptom:** The Metro bundler crashed repeatedly on Windows with `Error: EMFILE: too many open files` or `ENOENT: no such file or directory, lstat 'D:\EMI\node_modules\.expo-...'`.
- **Root Cause:** Metro was aggressively trying to watch dynamically generated Gradle `.cxx` and `build` folders inside the `.expo` cache and nested `node_modules` folders on Windows OS.
- **Resolution by Agent:** 
  - Enforced starting the dev server exclusively with `npx expo start -c` to clear the Metro cache.
  - Manually scrubbed and deleted corrupted Gradle lock files when the build stalled.

### 🚨 Bug 2: Native Kotlin `NoClassDefFoundError` Launch Crash
- **Symptom:** The physical Android app crashed immediately on launch with `java.lang.NoClassDefFoundError: Failed resolution of: Lexpo/modules/kotlin/types/LazyKType`.
- **Root Cause:** The agent ran `npx expo install --fix` which updated core libraries (`expo`, `expo-modules-core`) to perfectly match SDK 56 in `package.json`. However, the physical `app-debug.apk` already installed on the phone still contained the *old* Kotlin binaries.
- **Resolution by Agent:** 
  - Executed `npx expo run:android` via terminal. This triggered a fresh Gradle build, compiled the new Kotlin code, and installed a synchronized APK onto the device. 
  - **LESSON:** Whenever native node modules (like `expo-av`, `expo-notifications`, etc.) are added or updated, the app MUST be recompiled using `run:android` or it will crash.

### 🚨 Bug 3: "Alarm" Feature Request & Reversion
- **Symptom:** The user requested an "Alarm" feature for notifications (expecting it to ring continuously and loudly until actively dismissed like a bedside alarm clock).
- **Root Cause:** The agent attempted to implement this by assigning `AndroidAudioUsage.ALARM` to the notification channel. However, `expo-notifications` does not support true alarm-clock behavior natively; it only plays short, standard notification sounds regardless of the channel importance.
- **Resolution by Agent:** 
  - Completely stripped out all Alarm toggles from the UI (`settings.tsx`), state (`LoanContext.tsx`), and channels (`notifications.ts`). 
  - Reverted the system back to standard, robust push notifications. 
  - **LESSON:** If true, looping alarms are requested in the future, the agent MUST embed a custom `.wav` resource file into `android/app/src/main/res/raw/` and link it to the notification channel.

### 🚨 Bug 4: Chronic ADB Disconnections
- **Symptom:** Terminal commands like `npx expo run:android` frequently failed with `CommandError: No Android connected device found`.
- **Root Cause:** The physical USB connection to device `CPH1989` was repeatedly dropping.
- **Resolution by Agent:** Instructed the user to physically reconnect the cable, verify USB debugging prompts on the screen, and re-run the build commands.
