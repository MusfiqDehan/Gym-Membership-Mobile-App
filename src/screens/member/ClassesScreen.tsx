import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  bookClass,
  cancelBooking,
  getMyBookings,
  getPublicSchedules,
  type ScheduleBooking,
  type TrainerSchedule,
} from '../../services/trainerService';
import { ApiError } from '../../lib/apiClient';
import { formatDate, timeRange } from '../../lib/format';

export function ClassesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState<TrainerSchedule[]>([]);
  const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, b] = await Promise.all([getPublicSchedules(), getMyBookings()]);
      setSchedules(s);
      setBookings(b);
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

  const bookingBySchedule = useMemo(() => {
    const map = new Map<number, ScheduleBooking>();
    bookings.forEach(b => {
      if (b.status !== 'cancelled') {
        map.set(b.schedule, b);
      }
    });
    return map;
  }, [bookings]);

  const handleBook = async (schedule: TrainerSchedule) => {
    setActingId(schedule.id);
    try {
      await bookClass(schedule.id);
      await load();
    } catch (e) {
      Alert.alert(
        'Could not book',
        e instanceof ApiError ? e.message : 'Please try again.',
      );
    } finally {
      setActingId(null);
    }
  };

  const handleCancel = async (booking: ScheduleBooking) => {
    setActingId(booking.schedule);
    try {
      await cancelBooking(booking.id);
      await load();
    } catch (e) {
      Alert.alert(
        'Could not cancel',
        e instanceof ApiError ? e.message : 'Please try again.',
      );
    } finally {
      setActingId(null);
    }
  };

  return (
    <Screen
      title="My Classes"
      subtitle="Browse the schedule and book your sessions"
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}>
      {schedules.length === 0 ? (
        <EmptyState
          title="No classes scheduled"
          message="Check back later for upcoming sessions."
        />
      ) : (
        <View className="gap-3">
          {schedules.map(schedule => {
            const booking = bookingBySchedule.get(schedule.id);
            const isBooked = !!booking;
            const isActing = actingId === schedule.id;
            const full = schedule.is_full && !isBooked;
            return (
              <Card key={schedule.id}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-semibold text-white">
                      {schedule.trainer_class_name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-white/55">
                      with {schedule.trainer_name}
                    </Text>
                  </View>
                  {schedule.is_cancelled ? (
                    <Badge label="Cancelled" tone="danger" />
                  ) : isBooked ? (
                    <Badge
                      label={booking.status === 'waitlisted' ? 'Waitlisted' : 'Booked'}
                      tone={booking.status === 'waitlisted' ? 'warning' : 'success'}
                    />
                  ) : full ? (
                    <Badge label="Full" tone="neutral" />
                  ) : null}
                </View>

                <View className="mt-3 gap-1">
                  <Text className="text-sm text-white/70">
                    {formatDate(schedule.scheduled_date)} •{' '}
                    {timeRange(schedule.start_time, schedule.end_time)}
                  </Text>
                  {schedule.location ? (
                    <Text className="text-sm text-white/55">{schedule.location}</Text>
                  ) : null}
                  {typeof schedule.available_spots === 'number' ? (
                    <Text className="text-xs text-white/45">
                      {schedule.available_spots} spots left
                    </Text>
                  ) : null}
                </View>

                {!schedule.is_cancelled ? (
                  <View className="mt-4">
                    {isBooked ? (
                      <Pressable
                        disabled={isActing}
                        onPress={() => handleCancel(booking)}
                        className="items-center rounded-2xl border border-danger/40 bg-danger/10 py-3">
                        <Text className="text-sm font-semibold text-danger">
                          {isActing ? 'Cancelling…' : 'Cancel booking'}
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        disabled={isActing || full}
                        onPress={() => handleBook(schedule)}
                        className={`items-center rounded-2xl py-3 ${
                          full ? 'bg-white/5' : 'bg-brand-400'
                        }`}>
                        <Text
                          className={`text-sm font-semibold ${
                            full ? 'text-white/40' : 'text-ink-950'
                          }`}>
                          {isActing ? 'Booking…' : full ? 'Class full' : 'Book class'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
