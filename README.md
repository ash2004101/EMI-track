# 💰 EMI Tracker Pro

A beautifully designed, premium EMI (Equated Monthly Installment) Tracker built with **React Native (Expo)**. This application allows users to cleanly manage their active loans, track upcoming due dates, and dynamically calculate their monthly financial obligations.

## ✨ Features
- **Mobile-First Glassmorphism UI**: A stunning, premium dark-mode aesthetic with interactive visual feedback.
- **Smart Analytics Dashboard**: Instantly track your Total Outstanding Principal and Total Paid across all active loans.
- **Background Native Reminders**: Built-in Android push notifications that automatically alert you at 9:00 AM and 5:00 PM on the day before and the day of your EMI due dates.
- **Dynamic Rollover**: Marking an EMI as "Paid" instantly cancels its current notifications, advances the due date by 1 month, and reschedules a fresh batch of reminders.
- **Fully Optimized APK**: The Android pipeline is natively configured with **R8 Minification**, **Resource Shrinking**, and **ABI Splits** to produce an ultra-lightweight `arm64-v8a` executable.

---

## 🚀 How to Run Locally

If you are a new developer cloning this repository, follow these exact steps to get the app running on your machine.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en) (v18+)
- [Git](https://git-scm.com/)
- [Android Studio](https://developer.android.com/studio) (for Android SDKs and Emulators)

### 2. Installation
Open your terminal and clone the repository:
```bash
git clone https://github.com/ash2004101/EMI-track.git
cd EMI-track
```

Install all the JavaScript dependencies:
```bash
npm install
```

### 3. Running the App
Since this is an Expo project with custom native Android configurations, the easiest way to test it is to run the Expo development server:

```bash
npm start
```
*You can now press `a` to open it on an Android emulator, or scan the QR code using the **Expo Go** app on your physical phone.*

---

## 🛠️ How to Build the Production APK

We have explicitly configured the `android` folder to produce a highly-compressed Production APK. 

To build the APK from scratch:
```bash
cd android
./gradlew assembleRelease
```

Once the compilation is completely finished, your optimized APK will be located at:
`android/app/build/outputs/apk/release/app-arm64-v8a-release.apk`
