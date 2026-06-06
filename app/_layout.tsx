import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LoanProvider } from '../context/LoanContext';
import { setupNotificationHandler, requestNotificationPermissions } from '../services/notifications';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '../constants/theme';

export default function RootLayout() {
  useEffect(() => {
    setupNotificationHandler();
    requestNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <LoanProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.bgCard },
            headerTintColor: Colors.textPrimary,
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: Colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-loan"
            options={{
              title: 'Add New Loan',
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerStyle: { backgroundColor: Colors.bgCard },
            }}
          />
          <Stack.Screen
            name="loan/[id]"
            options={{
              title: 'Loan Details',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="edit-loan/[id]"
            options={{
              title: 'Edit Loan',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
      </LoanProvider>
    </SafeAreaProvider>
  );
}
