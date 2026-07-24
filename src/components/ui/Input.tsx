import React from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
};

export function Input({ label, error, hint, ...rest }: Props) {
  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 text-sm font-medium text-white/80">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        className={`w-full rounded-2xl border bg-ink-900 px-4 py-4 text-base text-white ${
          error ? 'border-danger' : 'border-white/12'
        }`}
        {...rest}
      />
      {error ? (
        <Text className="mt-1.5 text-sm text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-white/45">{hint}</Text>
      ) : null}
    </View>
  );
}
