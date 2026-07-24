import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'InvoiceWebView'>;

/**
 * Renders an authenticated invoice PDF inside a WebView by forwarding the
 * Bearer token and tenant hint as request headers.
 */
export function InvoiceWebViewScreen({ route, navigation }: Props) {
  const { url, headers, title } = route.params;
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-ink-950" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-white/10 px-4 py-3">
        <Text className="text-base font-semibold text-white">
          {title ?? 'Invoice'}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          className="rounded-full bg-white/10 px-3 py-1.5">
          <Text className="text-sm font-medium text-white">Close</Text>
        </Pressable>
      </View>
      <View className="flex-1">
        <WebView
          source={{ uri: url, headers }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          startInLoadingState
        />
        {loading ? (
          <View className="absolute inset-0 items-center justify-center bg-ink-950/60">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
