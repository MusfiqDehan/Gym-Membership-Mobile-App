import React from 'react';
import { Text, View } from 'react-native';

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand-400/15 text-brand-300',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  neutral: 'bg-white/10 text-white/70',
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const [bg, text] = toneClasses[tone].split(' ');
  return (
    <View className={`self-start rounded-full px-3 py-1 ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
