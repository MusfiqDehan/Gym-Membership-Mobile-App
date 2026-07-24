import React, { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  getMyBookings,
  type BookingStatus,
  type ScheduleBooking,
} from '../../services/trainerService';
import { formatDate, timeRange } from '../../lib/format';

const statusTone: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'brand'> = {
  confirmed: 'success',
  waitlisted: 'warning',
  cancelled: 'danger',
  attended: 'brand',
  no_show: 'neutral',
};

const statusLabel: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  waitlisted: 'Waitlisted',
  cancelled: 'Cancelled',
  attended: 'Attended',
  no_show: 'No show',
};

export function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<ScheduleBooking[]>([]);

  const load = useCallback(async () => {
    try {
      setBookings(await getMyBookings());
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

  const stats = useMemo(() => {
    const total = bookings.length;
    const attended = bookings.filter(b => b.status === 'attended').length;
    const upcoming = bookings.filter(
      b => b.status === 'confirmed' || b.status === 'waitlisted',
    ).length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const completion = total ? Math.round((attended / total) * 100) : 0;
    return { total, attended, upcoming, cancelled, completion };
  }, [bookings]);

  const recent = useMemo(
    () =>
      [...bookings]
        .sort((a, b) =>
          (b.schedule_info.date + b.schedule_info.start_time).localeCompare(
            a.schedule_info.date + a.schedule_info.start_time,
          ),
        )
        .slice(0, 8),
    [bookings],
  );

  const cells = [
    { label: 'Total bookings', value: stats.total },
    { label: 'Attended', value: stats.attended },
    { label: 'Upcoming', value: stats.upcoming },
    { label: 'Cancelled', value: stats.cancelled },
  ];

  return (
    <Screen
      title="My Progress"
      subtitle="Track your class activity and consistency"
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}>
      <Card className="mb-4 items-center">
        <Text className="text-5xl font-bold text-brand-400">{stats.completion}%</Text>
        <Text className="mt-1 text-sm text-white/55">Attendance completion</Text>
        <View className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <View
            className="h-full rounded-full bg-brand-400"
            style={{ width: `${stats.completion}%` }}
          />
        </View>
      </Card>

      <View className="mb-4 flex-row flex-wrap" style={{ gap: 12 }}>
        {cells.map(cell => (
          <View key={cell.label} style={{ width: '47%' }}>
            <Card>
              <Text className="text-3xl font-bold text-white">{cell.value}</Text>
              <Text className="mt-1 text-sm text-white/55">{cell.label}</Text>
            </Card>
          </View>
        ))}
      </View>

      <Text className="mb-3 text-sm font-semibold text-white/80">Recent activity</Text>
      {recent.length === 0 ? (
        <EmptyState
          title="No activity yet"
          message="Book and attend classes to build your progress."
        />
      ) : (
        <View className="gap-3">
          {recent.map(b => (
            <Card key={b.id}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-semibold text-white">
                    {b.schedule_info.class_name}
                  </Text>
                  <Text className="mt-0.5 text-xs text-white/55">
                    {formatDate(b.schedule_info.date)} •{' '}
                    {timeRange(b.schedule_info.start_time, b.schedule_info.end_time)}
                  </Text>
                </View>
                <Badge label={statusLabel[b.status]} tone={statusTone[b.status]} />
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
