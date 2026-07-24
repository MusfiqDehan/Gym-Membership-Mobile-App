import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/member/DashboardScreen';
import { ClassesScreen } from '../screens/member/ClassesScreen';
import { ProgressScreen } from '../screens/member/ProgressScreen';
import { ReviewsScreen } from '../screens/member/ReviewsScreen';
import { SubscriptionScreen } from '../screens/member/SubscriptionScreen';
import { colors } from '../theme/colors';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const icons: Record<keyof TabParamList, string> = {
  Dashboard: '⌂',
  Classes: '◷',
  Progress: '▲',
  Reviews: '★',
  Subscription: '✦',
};

const labels: Record<keyof TabParamList, string> = {
  Dashboard: 'Home',
  Classes: 'Classes',
  Progress: 'Progress',
  Reviews: 'Reviews',
  Subscription: 'Plan',
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgAlt,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarLabel: labels[route.name],
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 20, color }}>{icons[route.name]}</Text>
        ),
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Reviews" component={ReviewsScreen} />
      <Tab.Screen name="Subscription" component={SubscriptionScreen} />
    </Tab.Navigator>
  );
}
