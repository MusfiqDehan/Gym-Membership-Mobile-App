import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getSubdomain } from '../../lib/storage';
import { ApiError } from '../../lib/apiClient';
import type { RootStackParamList } from '../../navigation/types';

const logo = require('../../assets/fitssort-logo-dark.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubdomain().then(stored => {
      if (stored) {
        setSubdomain(stored);
      }
    });
  }, []);

  const handleLogin = async () => {
    setError(null);
    if (!subdomain.trim()) {
      setError('Enter your gym code (subdomain) to continue.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password, subdomain);
      // Navigation switches to Tabs automatically via auth state.
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : 'Unable to sign in. Check your connection and try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mb-8 items-center">
            <Image
              source={logo}
              resizeMode="contain"
              style={{ width: 200, height: 72 }}
            />
            <Text className="mt-4 text-2xl font-bold text-white">Welcome back</Text>
            <Text className="mt-1 text-center text-sm text-white/55">
              Sign in to your member workspace
            </Text>
          </View>

          {error ? (
            <View className="mb-4 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3">
              <Text className="text-sm text-danger">{error}</Text>
            </View>
          ) : null}

          <View className="gap-4">
            <Input
              label="Gym code"
              placeholder="your-gym"
              autoCapitalize="none"
              autoCorrect={false}
              value={subdomain}
              onChangeText={setSubdomain}
              hint="The subdomain your gym uses (e.g. your-gym.fitssort.com)."
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            <View>
              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setShowPassword(v => !v)}
                className="mt-2 self-end">
                <Text className="text-xs font-medium text-brand-400">
                  {showPassword ? 'Hide password' : 'Show password'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-7">
            <Button title="Sign in" loading={submitting} onPress={handleLogin} />
          </View>

          <View className="mt-6 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-white/55">New member?</Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text className="text-sm font-semibold text-brand-400">
                Join a gym
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
