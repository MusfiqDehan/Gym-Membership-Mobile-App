import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import { colors } from '../../theme/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = PressableProps & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

const containerByVariant: Record<Variant, string> = {
  primary: 'bg-brand-400',
  secondary: 'bg-white/10 border border-white/15',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const textByVariant: Record<Variant, string> = {
  primary: 'text-ink-950',
  secondary: 'text-white',
  ghost: 'text-brand-400',
  danger: 'text-white',
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-2xl px-5 py-4 ${
        containerByVariant[variant]
      } ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-60' : ''}`}
      {...rest}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.bg : colors.text}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className={`text-base font-semibold ${textByVariant[variant]}`}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
