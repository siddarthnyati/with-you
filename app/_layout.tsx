import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#FFF5F0' },
        headerTintColor: '#7A2A3A',
        headerTitleStyle: { fontWeight: '700', fontSize: 20 },
        tabBarStyle: {
          backgroundColor: '#FFF5F0',
          borderTopColor: '#F4D0D8',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#C4607A',
        tabBarInactiveTintColor: '#C4A8B0',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="(tabs)/index"
        options={{
          title: 'With You',
          tabBarLabel: 'Send',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
