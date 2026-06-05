import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LoanProvider } from '../context/LoanContext';
import { setupNotificationHandler, requestNotificationPermissions } from '../services/notifications';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useEffect(() => {
    setupNotificationHandler();
    requestNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <LoanProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#0F0F1A' },
            headerTintColor: '#F0EFFB',
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: '#0F0F1A' },
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
              headerStyle: { backgroundColor: '#1A1A2E' },
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
