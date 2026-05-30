import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  loading = false,
  refreshing = false,
  onRefresh,
  edges = ['top'],
}: Props) {
  const header =
    title || subtitle ? (
      <View className="mb-5">
        {title ? (
          <Text className="text-2xl font-bold text-white">{title}</Text>
        ) : null}
        {subtitle ? (
          <Text className="mt-1 text-sm text-white/55">{subtitle}</Text>
        ) : null}
      </View>
    ) : null;

  if (loading) {
    return (
      <SafeAreaView edges={edges} className="flex-1 bg-ink-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-ink-950">
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.brand}
                colors={[colors.brand]}
              />
            ) : undefined
          }>
          {header}
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 p-5">
          {header}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
