import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../assets/fitssort-logo-dark.png');

/**
 * Opening splash with a Fitssort logo animation built purely on the React
 * Native Animated API (no extra animation dependencies). The logo fades and
 * scales in, the tagline fades up, and a row of dots pulses to indicate the
 * app is loading before the login screen appears.
 */
export function SplashScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineShift = useRef(new Animated.Value(12)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(taglineShift, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 420,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 420,
            useNativeDriver: true,
          }),
        ]),
      );

    const loop = Animated.parallel([
      pulse(dot1, 0),
      pulse(dot2, 160),
      pulse(dot3, 320),
    ]);
    loop.start();

    return () => loop.stop();
  }, [logoOpacity, logoScale, taglineOpacity, taglineShift, dot1, dot2, dot3]);

  return (
    <SafeAreaView className="flex-1 bg-ink-950">
      <View className="flex-1 items-center justify-center px-10">
        <Animated.View
          style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Image
            source={logo}
            resizeMode="contain"
            style={{ width: 240, height: 90 }}
          />
        </Animated.View>

        <Animated.Text
          className="mt-6 text-center text-sm tracking-widest text-white/55"
          style={{ opacity: taglineOpacity, transform: [{ translateY: taglineShift }] }}>
          YOUR FITNESS, ELEVATED
        </Animated.Text>
      </View>

      <View className="absolute bottom-16 w-full flex-row items-center justify-center gap-2">
        {[dot1, dot2, dot3].map((dot, idx) => (
          <Animated.View
            key={idx}
            style={{ opacity: dot }}
            className="h-2.5 w-2.5 rounded-full bg-brand-400"
          />
        ))}
      </View>
    </SafeAreaView>
  );
}
