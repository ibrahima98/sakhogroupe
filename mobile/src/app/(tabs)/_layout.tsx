import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type TabIconProps = { color: ColorValue; focused: boolean; size: number };

function TabIcon({ name, focusedName, color, focused, size }: TabIconProps & { name: IconName; focusedName: IconName }) {
  return <Ionicons name={focused ? focusedName : name} color={color as string} size={size} />;
}

// Barre du bas : Accueil, Coran, Prières, Plus (cahier des charges, Menu Plus).
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.emerald,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: { fontFamily: Fonts.medium, fontSize: 11 },
        tabBarStyle: { backgroundColor: Colors.card, borderTopColor: Colors.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: (p: TabIconProps) => <TabIcon {...p} name="home-outline" focusedName="home" />,
        }}
      />
      <Tabs.Screen
        name="coran"
        options={{
          title: 'Coran',
          tabBarIcon: (p: TabIconProps) => <TabIcon {...p} name="book-outline" focusedName="book" />,
        }}
      />
      <Tabs.Screen
        name="prieres"
        options={{
          title: 'Prières',
          tabBarIcon: (p: TabIconProps) => <TabIcon {...p} name="time-outline" focusedName="time" />,
        }}
      />
      <Tabs.Screen
        name="plus"
        options={{
          title: 'Plus',
          tabBarIcon: (p: TabIconProps) => <TabIcon {...p} name="grid-outline" focusedName="grid" />,
        }}
      />
    </Tabs>
  );
}
