import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 16) + 16, // Dynamically adapts to Swipe Gestures vs Navigation Buttons
          left: 24,
          right: 24,
          backgroundColor: 'rgba(15, 15, 19, 0.95)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 999,
          height: 64,
          paddingBottom: 0,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 14, // Pushes icons back to exact vertical center
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false,
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '800', fontSize: 24, letterSpacing: 0.5 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
          headerTitle: 'EMI Tracker',
          headerRight: () => null,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pie-chart" size={size} color={color} />
          ),
          headerTitle: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications-active" size={size} color={color} />
          ),
          headerTitle: 'Notification Settings',
        }}
      />
    </Tabs>
  );
}
