import React from 'react';
import { Text, View } from 'react-native';

export function EmptyState({
  title,
  message,
  icon = '•',
}: {
  title: string;
  message?: string;
  icon?: string;
}) {
  return (
    <View className="items-center justify-center rounded-3xl border border-dashed border-white/12 bg-ink-900 px-6 py-12">
      <Text className="mb-2 text-3xl text-brand-400">{icon}</Text>
      <Text className="text-center text-base font-semibold text-white">{title}</Text>
      {message ? (
        <Text className="mt-1 text-center text-sm text-white/50">{message}</Text>
      ) : null}
    </View>
  );
}
