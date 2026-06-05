# EMI TRACKER - STRICT AGENT RULES

**CRITICAL INSTRUCTION:** Any AI Agent interacting with this project MUST adhere strictly to the following rules. Failure to do so will result in app instability.

---

## 1. STYLING & UI RULES
- **NO TAILWIND CSS:** Do NOT attempt to install or use TailwindCSS, NativeWind, or any utility-class styling frameworks. This project strictly relies on Vanilla React Native `StyleSheet`.
- **USE DESIGN TOKENS:** All colors, spacing, and font sizes must be pulled from `constants/theme.ts`. Do not hardcode raw hex values (like `#FFFFFF` or `#0F0F1A`) directly in components. Import `Colors` from the theme.
- **PHYSICS TOUCHES:** When creating interactive elements (buttons, cards), you must wrap them in the custom `components/AnimatedTouchable.tsx` instead of standard `<TouchableOpacity>` to maintain the 60fps Apple-style bounce animation across the app.

## 2. NATIVE BUILD RULES (CRITICAL)
- **EXPO INSTALLS:** Whenever you add a new native dependency (e.g., `expo-av`, `expo-notifications`, `react-native-svg`), or if you run `npx expo install --fix`, the physical Android app (`base.apk`) becomes instantly out of sync with the Javascript code.
- **MANDATORY RECOMPILATION:** If native node modules are updated, you **MUST** run `npx expo run:android` in the terminal to trigger a Gradle rebuild and push a fresh APK to the connected device. If you skip this step, the app will crash with `NoClassDefFoundError`.

## 3. NOTIFICATION & ALARM RULES
- **STRICTLY NO ALARMS:** The user has explicitly forbidden any continuous "Alarm Clock" features. 
- **ONLY STANDARD NOTIFICATIONS:** Do NOT attempt to build an alarm feature. All reminders must remain as standard, quiet push notifications. Never add alarm toggles back to the UI.

## 4. METRO BUNDLER RULES
- **WINDOWS CACHE BUGS:** On Windows, the Metro bundler often chokes on deeply nested dynamically generated Gradle caches (`Error: EMFILE` or `ENOENT`). 
- **CLEAR CACHE:** Always start the dev server using `npx expo start -c` to ensure a clean cache. If builds hang indefinitely, manually verify there are no stale lock files in `.expo`.

## 5. VERSION CONTROL
- **GIT IS TRUTH:** This project relies on Git for exact line-by-line history tracking. After completing a significant feature or bug fix, you should run `git add .` and `git commit -m "..."` to preserve the state.

## 6. AUTO-DOCUMENTATION (CRITICAL)
- **SILENT UPDATES:** Every time you complete a task, fix a major bug, or add a new file, you MUST automatically update `.core/SESSION_HISTORY.md` and `.core/ARCHITECTURE.md` to reflect your changes. 
- Do NOT wait for the user to ask you to update the documentation. You must do this silently and automatically before finishing your work.
