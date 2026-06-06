# EMI TRACKER - COMPLETE PROJECT FILE STRUCTURE & CODE MAP

This document is the master index of the entire project. It contains a complete file tree and a block-by-block code map of every single file in the project to instantly find what controls which logic.

---

## PROJECT FILE STRUCTURE

```text
D:\EMI\
├── .Core/                     # AI Documentation Brain
│   ├── ARCHITECTURE.md        # (This File) Full file structure & code map
│   ├── SESSION_HISTORY.md     # Logs of changes, bugs, and fixes
│   └── TODO.md                # Pending tasks
├── app/                       # Expo Router Screens & Layouts
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Bottom Tab Bar configuration
│   │   ├── analytics.tsx      # Analytics tab
│   │   ├── index.tsx          # Dashboard tab
│   │   └── settings.tsx       # Settings tab
│   ├── loan/
│   │   └── [id].tsx           # Loan details screen
│   ├── edit-loan/
│   │   └── [id].tsx           # Edit loan screen
│   ├── _layout.tsx            # Global stack & Context wrapper
│   └── add-loan.tsx           # Add Loan modal screen
├── assets/                    # Static Assets
│   ├── fonts/                 # Custom fonts (SpaceMono)
│   └── images/                # App icons, splash screens, favicon
├── components/                # Reusable UI Components
│   ├── AnimatedTouchable.tsx  # Physics-based touch wrapper
│   ├── CustomDatePickerModal.tsx # Native-feeling 3-wheel date selector
│   ├── FormField.tsx          # Reusable text input
│   ├── LoanCard.tsx           # Main EMI list card
│   ├── PaymentHistoryItem.tsx # Individual payment record row
│   └── SummaryCard.tsx        # Dashboard metric squares
├── constants/
│   └── theme.ts               # Core design system tokens (Colors, Spacing)
├── context/
│   └── LoanContext.tsx        # Global State Management & Logic
├── services/
│   ├── notifications.ts       # Push notification scheduling engine
│   └── storage.ts             # AsyncStorage database functions
├── types/
│   └── index.ts               # TypeScript interfaces & types
├── app.json                   # Expo App Configuration (Bundle ID, Icons)
├── eas.json                   # Expo Application Services config
├── index.ts                   # Expo Entry Point
├── package.json               # Project dependencies & scripts
└── tsconfig.json              # TypeScript compiler configuration
```

---

## FULL CODE MAP (BLOCK BY BLOCK)

### 1. ROOT & CONFIGURATION FILES

#### 📂 `package.json`
- Defines project metadata and dependencies.
- Contains all Expo SDK 56 libraries (`expo`, `expo-router`, `expo-notifications`, `react-native`, etc.).

#### 📂 `app.json`
- Configures the compiled app. Defines `bundleIdentifier` (`com.emitracker.app`), app name, splash screen colors (`#0F0F1A`), and native iOS/Android permissions.

#### 📂 `index.ts`
- Imports `expo-router/entry` to bootstrap the application flow.

---

### 2. APP DIRECTORY (ROUTING & SCREENS)

#### 📂 `app/_layout.tsx` (Global Stack)
- **Lines 1-8:** Imports (React, Expo Router, Contexts).
- **Lines 10-13:** `useEffect` block initializing Notification permissions on app startup.
- **Lines 15-56:** `<SafeAreaProvider>` and `<LoanProvider>` wrappers.
- **Lines 19-53:** `<Stack>` definition. Controls the global header color (`#0F0F1A`) and slide animations.
  - Registers `(tabs)` as the hidden-header default screen.
  - Registers `add-loan` as a modal screen sliding from bottom.
  - Registers `loan/[id]` and `edit-loan/[id]` screens.

#### 📂 `app/(tabs)/_layout.tsx` (Bottom Tab Bar)
- **Lines 10-38:** `<Tabs>` global options. 
  - **Lines 12-29:** `tabBarStyle` block: Floating Glass Tab Bar styling using `rgba` colors and border radii. 
  - **Line 14:** `bottom: Math.max(insets.bottom, 16) + 16` ensures the tab bar floats above Android gestures.
  - **Lines 30-34:** `tabBarItemStyle` applies padding to center the icons vertically inside the floating bar.
- **Lines 44-74:** Registers "Dashboard", "Analytics", and "Settings" tabs with custom `TabBarIcon`s.

#### 📂 `app/(tabs)/index.tsx` (Main Dashboard)
- **Lines 32-47:** Filtering & Sorting logic (Overdue -> Pending -> Paid, then by Date).
- **Lines 49-50:** Math logic calculating Total Monthly EMI.
- **Lines 61-103:** `WalletHeader` UI Component Block. Renders the top UI card, the huge total amount, and the horizontal `<ScrollView>` for Filter Chips.
- **Lines 117-142:** Main `<FlatList>` block. Maps data to `<LoanCard>` components. 
- **Lines 144-150:** THE FAB BLOCK. Controls the floating `+` button in the bottom right corner.
- **Lines 154-334:** Stylesheet. Includes `walletCard` (top header) and `fab` classes.

#### 📂 `app/(tabs)/analytics.tsx` (Analytics Screen)
- **Lines 13-30:** Math logic reducing state arrays to calculate `totalPayable`, `totalPaid`, and `totalOutstanding`.
- **Lines 56-67:** UI layout rendering 2x2 grid of `SummaryCard`s.

#### 📂 `app/(tabs)/settings.tsx` (Settings Screen)
- **Lines 42-143:** `<CustomTimePickerModal>` logic. A completely custom native-looking modal to pick 24-hour times without external dependencies.
- **Lines 145-177:** `<TimeRow>` reusable UI component.
- **Lines 247-303:** Main Menu view. Renders the "Notification Engine Active" banner, and menus for "Pre-Due" and "Due Date" alerts.
- **Lines 305-373:** Sub-views. Switches UI to show specific `TimeRow` selectors.
- **Lines 227-244:** `handleTestNotification()` to trigger a local reminder instantly for verification.

#### 📂 `app/add-loan.tsx` (Add Loan Modal)
- **Lines 53-76:** `validate()` function throwing alerts on empty strings or invalid numbers.
- **Lines 78-106:** `handleSave()` function parsing input, generating UUID, and dispatching to Context.
- **Lines 115-172:** Form rendering block using `<FormField>` components.

#### 📂 `app/loan/[id].tsx` (Loan Details)
- **Lines 41-110:** Fetches specific loan by `id` parameter. Handles "Mark EMI as Paid" and "Delete Loan" prompts.
- **Lines 113-178:** Hero Card UI (Loan Name, Type, Status Badge, EMI Amount, Due Date tag).
- **Lines 180-199:** Progress Bar UI block.
- **Lines 211-238:** Info Grid UI (Loan Type, Added On, Payments Made, Total Paid).
- **Lines 241-262:** Action Buttons Block (Mark as Paid, Edit, Delete).
- **Lines 264-280:** Payment History `<FlatList>`.

---

### 3. COMPONENTS DIRECTORY (REUSABLE UI)

**Purpose:** Pure, stateless presentational components.

1. **`FormField.tsx`**
   - Standardized input field across the entire app.
   - Handles text input, numeric input, multi-line notes, validation errors, and `onPress` overlays (for triggering Modals instead of typing).
   - Strict theming applied to focused and unfocused states.

2. **`CustomDatePickerModal.tsx`**
   - A highly custom, native-feeling scroll-wheel modal.
   - Provides 3 vertical scroll columns (Day, Month, Year) to easily pick dates without relying on heavy third-party iOS/Android native packages.
   - Currently used heavily in the Due Date fields of Add Loan and Edit Loan screens.

3. **`AnimatedTouchable.tsx`**
   - Wrapper around `Pressable` using `react-native-reanimated`.
   - Adds a subtle scale-down spring physics effect when users tap buttons, making the app feel alive.

4. **`LoanCard.tsx`**
   - Renders a loan on the dashboard (`app/(tabs)/index.tsx`).
   - Calculates progress bars and formats currency visually.

5. **`SummaryCard.tsx`**
   - Renders the small metric blocks on the dashboard (e.g., "Active Loans", "Monthly EMI").

6. **`PaymentHistoryItem.tsx`**
   - Renders a single payment log inside the Loan Details screen (`app/loan/[id].tsx`).

---

### 4. SERVICES & CONTEXT (DATA & LOGIC)

#### 📂 `context/LoanContext.tsx`
- **Lines 26-56:** Defines the `LoanState` interface and `NotificationSettings` defaults.
- **Lines 58-105:** The `reducer` block. Handles state updates (`ADD_LOAN`, `UPDATE_LOAN`, `MARK_AS_PAID`).
- **Lines 126-142:** `refreshLoans` pulls initial data from AsyncStorage. Auto-updates any 'Pending' loans to 'Overdue' if `Date.now() > dueDate`.
- **Lines 172-209:** `markAsPaid()` logic. Saves a payment record. If the loan is fully paid, marks it 'Paid'. Otherwise, increments `dueDate` by 1 month and reschedules push notifications.

#### 📂 `services/storage.ts`
- Uses `@react-native-async-storage/async-storage`.
- **Keys:** `emi_tracker_loans`, `emi_tracker_payments`, `emi_tracker_notification_settings`.
- Provides `getData()` and `storeData()` wrapper functions.

#### 📂 `services/notifications.ts`
- **Lines 7-35:** `requestNotificationPermissions()`. Creates the `emi-reminders` Android OS channel.
- **Lines 50-56:** `buildTriggerDate()`. Math logic to generate exact Javascript `Date` objects based on target times.
- **Lines 63-125:** `scheduleNotificationsForLoan()`. The core notification engine! Generates 4 notifications per loan:
  1. `d1_morning` (Day before)
  2. `d1_afternoon` (Day before)
  3. `d0_morning` (Due date morning)
  4. `d0_evening` (Due date evening warning)

---

### 5. CONSTANTS & TYPES

#### 📂 `constants/theme.ts`
- Core Design System.
- Contains exact HEX codes for `Colors` (`bg`, `primary`, `danger`, `success`, `warning`).
- Contains `FontSize`, `Spacing`, and `Radius` tokens for 100% UI consistency.
- `LoanTypeColors` maps string types to colors (e.g., Home = Blue, Car = Purple).

#### 📂 `types/index.ts`
- TypeScript Definitions.
- **Lines 26-35:** `NotificationSettings` strict interface for the 4 reminder times.
- Defines the global `Loan` and `Payment` interface structures.
