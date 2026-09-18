import { Tabs } from 'expo-router';
import { House, IdCard, Receipt, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { FloatingTabBar, useTheme } from '@/design-system';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.color.background },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <House size={size} color={color} strokeWidth={focused ? 2.2 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="card"
        options={{
          title: t('tabs.card'),
          tabBarIcon: ({ color, size, focused }) => (
            <IdCard size={size} color={color} strokeWidth={focused ? 2.2 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: t('tabs.payments'),
          tabBarIcon: ({ color, size, focused }) => (
            <Receipt size={size} color={color} strokeWidth={focused ? 2.2 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <User size={size} color={color} strokeWidth={focused ? 2.2 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
