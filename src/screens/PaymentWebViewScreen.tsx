import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentWebView'>;

type Outcome = 'success' | 'fail' | 'cancel' | null;

function detectOutcome(url: string): Outcome {
  const lower = url.toLowerCase();
  if (
    lower.includes('payment_status=success') ||
    /payments?\/success/.test(lower) ||
    lower.includes('status=valid')
  ) {
    return 'success';
  }
  if (
    lower.includes('payment_status=fail') ||
    /payments?\/fail/.test(lower) ||
    lower.includes('status=failed')
  ) {
    return 'fail';
  }
  if (
    lower.includes('payment_status=cancel') ||
    /payments?\/cancel/.test(lower) ||
    lower.includes('status=cancelled')
  ) {
    return 'cancel';
  }
  return null;
}

export function PaymentWebViewScreen({ route, navigation }: Props) {
  const { url, mode, title } = route.params;
  const [loading, setLoading] = useState(true);
  const handled = useRef(false);

  const finish = (outcome: Exclude<Outcome, null>) => {
    if (handled.current) {
      return;
    }
    handled.current = true;

    const onClose = () => {
      if (mode === 'register' && outcome === 'success') {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        navigation.goBack();
      }
    };

    if (outcome === 'success') {
      Alert.alert(
        'Payment successful',
        mode === 'register'
          ? 'Your membership is set up. Check your email to set your password, then sign in.'
          : 'Your payment has been received.',
        [{ text: 'OK', onPress: onClose }],
      );
    } else if (outcome === 'fail') {
      Alert.alert('Payment failed', 'Your payment could not be completed.', [
        { text: 'OK', onPress: onClose },
      ]);
    } else {
      Alert.alert('Payment cancelled', 'The payment was cancelled.', [
        { text: 'OK', onPress: onClose },
      ]);
    }
  };

  const handleNavChange = (navState: WebViewNavigation) => {
    const outcome = detectOutcome(navState.url);
    if (outcome) {
      finish(outcome);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-950" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-white/10 px-4 py-3">
        <Text className="text-base font-semibold text-white">
          {title ?? 'Payment'}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          className="rounded-full bg-white/10 px-3 py-1.5">
          <Text className="text-sm font-medium text-white">Cancel</Text>
        </Pressable>
      </View>

      <View className="flex-1">
        <WebView
          source={{ uri: url }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavChange}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
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
