import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import {
  getMyBookings,
  getMyRatings,
  rateTrainer,
  type TrainerRating,
} from '../../services/trainerService';
import { ApiError } from '../../lib/apiClient';
import { colors } from '../../theme/colors';
import { formatDate } from '../../lib/format';

type TrainerOption = { id: number; name: string };

function Stars({
  value,
  onChange,
  size = 32,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <View className="flex-row" style={{ gap: 6 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Pressable
          key={star}
          disabled={!onChange}
          onPress={() => onChange?.(star)}
          hitSlop={6}>
          <Text style={{ fontSize: size, color: star <= value ? colors.brand : colors.textFaint }}>
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ReviewsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratings, setRatings] = useState<TrainerRating[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);

  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [myRatings, bookings] = await Promise.all([
        getMyRatings(),
        getMyBookings(),
      ]);
      setRatings(myRatings);
      const map = new Map<number, string>();
      bookings.forEach(b => {
        const id = b.schedule_info.trainer_id;
        if (typeof id === 'number') {
          map.set(id, b.schedule_info.trainer_name);
        }
      });
      setTrainers(Array.from(map, ([id, name]) => ({ id, name })));
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

  const ratedTrainerIds = useMemo(
    () => new Set(ratings.map(r => r.trainer)),
    [ratings],
  );

  const handleSubmit = async () => {
    if (!selectedTrainer) {
      Alert.alert('Select a trainer', 'Please choose a trainer to review.');
      return;
    }
    if (rating < 1) {
      Alert.alert('Add a rating', 'Please tap a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      await rateTrainer(selectedTrainer, rating, review.trim());
      setSelectedTrainer(null);
      setRating(0);
      setReview('');
      await load();
      Alert.alert('Thank you', 'Your review has been submitted.');
    } catch (e) {
      Alert.alert(
        'Could not submit',
        e instanceof ApiError ? e.message : 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="My Reviews"
      subtitle="Rate your trainers and see your feedback"
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}>
      <Card className="mb-5">
        <Text className="text-base font-semibold text-white">Leave a review</Text>
        {trainers.length === 0 ? (
          <Text className="mt-2 text-sm text-white/55">
            Book a class first to review your trainer.
          </Text>
        ) : (
          <>
            <Text className="mt-4 mb-2 text-sm text-white/70">Trainer</Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {trainers.map(t => {
                const selected = selectedTrainer === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setSelectedTrainer(t.id)}
                    className={`rounded-full border px-4 py-2 ${
                      selected
                        ? 'border-brand-400 bg-brand-400/15'
                        : 'border-white/15 bg-white/5'
                    }`}>
                    <Text
                      className={`text-sm ${
                        selected ? 'font-semibold text-brand-300' : 'text-white/75'
                      }`}>
                      {t.name}
                      {ratedTrainerIds.has(t.id) ? ' ✓' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mt-4 mb-2 text-sm text-white/70">Rating</Text>
            <Stars value={rating} onChange={setRating} />

            <Text className="mt-4 mb-2 text-sm text-white/70">Review</Text>
            <TextInput
              placeholder="Share your experience…"
              placeholderTextColor={colors.textFaint}
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="min-h-20 rounded-2xl border border-white/12 bg-ink-800 px-4 py-3 text-base text-white"
            />

            <View className="mt-4">
              <Button title="Submit review" loading={submitting} onPress={handleSubmit} />
            </View>
          </>
        )}
      </Card>

      <Text className="mb-3 text-sm font-semibold text-white/80">Your reviews</Text>
      {ratings.length === 0 ? (
        <EmptyState title="No reviews yet" message="Your submitted reviews appear here." />
      ) : (
        <View className="gap-3">
          {ratings.map(r => (
            <Card key={r.id}>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-white">
                  {r.trainer_name ?? `Trainer #${r.trainer}`}
                </Text>
                <Stars value={r.rating} size={16} />
              </View>
              {r.review ? (
                <Text className="mt-2 text-sm text-white/70">{r.review}</Text>
              ) : null}
              {r.created_at ? (
                <Text className="mt-2 text-xs text-white/40">
                  {formatDate(r.created_at)}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
