import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, getMyRatings } from '../../services/trainerService';
import { timeRange, formatDate } from '../../lib/format';
import type { TabParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<TabParamList, 'Dashboard'>;

type Stat = { label: string; value: number | string; tab: keyof TabParamList };

export function DashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState(0);
  const [upcoming, setUpcoming] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reviews, setReviews] = useState(0);
  const [nextSession, setNextSession] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [bookings, ratings] = await Promise.all([
        getMyBookings(),
        getMyRatings(),
      ]);
      const active = bookings.filter(
        b => b.status === 'confirmed' || b.status === 'waitlisted',
      );
      const attended = bookings.filter(b => b.status === 'attended').length;
      const total = bookings.length || 1;
      setSelectedClasses(active.length);
      setUpcoming(active.length);
      setProgress(Math.round((attended / total) * 100));
      setReviews(ratings.length);

      const sorted = [...active].sort((a, b) =>
        (a.schedule_info.date + a.schedule_info.start_time).localeCompare(
          b.schedule_info.date + b.schedule_info.start_time,
        ),
      );
      const next = sorted[0];
      setNextSession(
        next
          ? `${next.schedule_info.class_name} • ${formatDate(
              next.schedule_info.date,
            )} ${timeRange(next.schedule_info.start_time, next.schedule_info.end_time)}`
          : null,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const stats: Stat[] = [
    { label: 'Selected classes', value: selectedClasses, tab: 'Classes' },
    { label: 'Upcoming sessions', value: upcoming, tab: 'Classes' },
    { label: 'Progress', value: `${progress}%`, tab: 'Progress' },
    { label: 'My reviews', value: reviews, tab: 'Reviews' },
  ];

  const firstName = user?.full_name?.split(' ')[0] ?? 'Member';

  return (
    <Screen
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}>
      <View className="mb-6 flex-row items-start justify-between">
        <View>
          <Text className="text-sm text-white/50">Welcome back,</Text>
          <Text className="text-2xl font-bold text-white">{firstName}</Text>
        </View>
        <Pressable
          onPress={logout}
          className="rounded-full border border-white/15 px-4 py-2">
          <Text className="text-sm font-medium text-white">Logout</Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {stats.map(stat => (
          <Pressable
            key={stat.label}
            onPress={() => navigation.navigate(stat.tab)}
            style={{ width: '47%' }}>
            <Card>
              <Text className="text-3xl font-bold text-brand-400">{stat.value}</Text>
              <Text className="mt-1 text-sm text-white/55">{stat.label}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <Card className="mt-4">
        <Text className="text-sm font-semibold text-white/80">Next session</Text>
        <Text className="mt-2 text-base text-white">
          {nextSession ?? 'No upcoming sessions. Book a class to get started.'}
        </Text>
      </Card>

      <View className="mt-4 gap-3">
        <Text className="text-sm font-semibold text-white/80">Quick links</Text>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {(
            [
              { label: 'Book a class', tab: 'Classes' },
              { label: 'My progress', tab: 'Progress' },
              { label: 'Rate a trainer', tab: 'Reviews' },
              { label: 'My subscription', tab: 'Subscription' },
            ] as { label: string; tab: keyof TabParamList }[]
          ).map(link => (
            <Pressable
              key={link.label}
              onPress={() => navigation.navigate(link.tab)}
              style={{ width: '47%' }}
              className="rounded-2xl border border-white/10 bg-ink-900 px-4 py-4">
              <Text className="text-base font-medium text-white">{link.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
