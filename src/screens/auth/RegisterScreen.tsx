import React, { useState } from 'react';
import {
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
import { Card } from '../../components/ui/Card';
import {
  getPublicPackages,
  registerAndCheckout,
  type MemberPackage,
} from '../../services/membershipService';
import { setSubdomain as persistSubdomain } from '../../lib/storage';
import { ApiError } from '../../lib/apiClient';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

function formatPrice(pkg: MemberPackage): string {
  const currency = pkg.currency ?? '৳';
  const value = typeof pkg.price === 'string' ? pkg.price : pkg.price?.toFixed?.(0);
  return `${currency}${value}`;
}

export function RegisterScreen({ navigation }: Props) {
  const [subdomain, setSubdomain] = useState('');
  const [packages, setPackages] = useState<MemberPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packagesLoaded, setPackagesLoaded] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPackages = async () => {
    setError(null);
    if (!subdomain.trim()) {
      setError('Enter your gym code first.');
      return;
    }
    setLoadingPackages(true);
    try {
      await persistSubdomain(subdomain);
      const list = await getPublicPackages();
      setPackages(list);
      setPackagesLoaded(true);
      if (list.length === 0) {
        setError('No packages are available for this gym.');
      }
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : 'Could not load packages. Check the gym code and try again.';
      setError(message);
      setPackagesLoaded(false);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!selectedPackageId) {
      setError('Please select a package.');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setError('Full name, phone and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await registerAndCheckout({
        full_name: fullName,
        phone_number: phone,
        email,
        member_package_id: selectedPackageId,
      });
      if (res.gateway_url) {
        navigation.navigate('PaymentWebView', {
          url: res.gateway_url,
          mode: 'register',
          title: 'Complete payment',
        });
      } else {
        setError(res.message ?? 'Registration started but no payment link was returned.');
      }
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : 'Registration failed. Please try again.';
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
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text className="text-2xl font-bold text-white">Join a gym</Text>
          <Text className="mt-1 text-sm text-white/55">
            Pick a membership and pay securely with SSLCommerz.
          </Text>

          {error ? (
            <View className="mt-5 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3">
              <Text className="text-sm text-danger">{error}</Text>
            </View>
          ) : null}

          <View className="mt-6 gap-4">
            <View className="flex-row items-end gap-3">
              <View className="flex-1">
                <Input
                  label="Gym code"
                  placeholder="your-gym"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={subdomain}
                  onChangeText={t => {
                    setSubdomain(t);
                    setPackagesLoaded(false);
                    setSelectedPackageId(null);
                  }}
                />
              </View>
              <View style={{ width: 120 }}>
                <Button
                  title="Find"
                  variant="secondary"
                  loading={loadingPackages}
                  onPress={loadPackages}
                />
              </View>
            </View>

            {packagesLoaded && packages.length > 0 ? (
              <View className="gap-3">
                <Text className="text-sm font-medium text-white/80">
                  Select a package
                </Text>
                {packages.map(pkg => {
                  const selected = selectedPackageId === pkg.id;
                  return (
                    <Pressable key={pkg.id} onPress={() => setSelectedPackageId(pkg.id)}>
                      <Card
                        className={selected ? 'border-brand-400 bg-brand-400/10' : ''}>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 pr-3">
                            <Text className="text-base font-semibold text-white">
                              {pkg.name}
                            </Text>
                            <Text className="mt-0.5 text-xs text-white/55">
                              {pkg.duration_in_days} days
                              {pkg.package_type ? ` • ${pkg.package_type}` : ''}
                            </Text>
                          </View>
                          <Text className="text-lg font-bold text-brand-400">
                            {formatPrice(pkg)}
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {selectedPackageId ? (
              <View className="gap-4">
                <Input
                  label="Full name"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <Input
                  label="Phone number"
                  placeholder="01XXXXXXXXX"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
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
                <Button
                  title="Continue to payment"
                  loading={submitting}
                  onPress={handleRegister}
                />
              </View>
            ) : null}
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-white/55">Already a member?</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text className="text-sm font-semibold" style={{ color: colors.brand }}>
                Sign in
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
