import React from 'react';
import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = '', ...rest }: Props) {
  return (
    <View
      className={`rounded-3xl border border-white/10 bg-ink-900 p-5 ${className}`}
      {...rest}>
      {children}
    </View>
  );
}
