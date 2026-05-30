import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  getMySubscription,
  type MySubscription,
  type PaymentRecord,
} from '../../services/membershipService';
import {
  getInvoiceRequest,
  initiatePayment,
} from '../../services/paymentService';
import { ApiError } from '../../lib/apiClient';
import { formatDate } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/types';

function isPaid(p: PaymentRecord): boolean {
  const status = (p.payment_status || p.status || '').toLowerCase();
  return status === 'paid' || status === 'completed' || status === 'success';
}

function paymentTone(p: PaymentRecord): 'success' | 'warning' | 'danger' {
  const status = (p.payment_status || p.status || '').toLowerCase();
  if (isPaid(p)) {
    return 'success';
  }
  if (status.includes('fail')) {
    return 'danger';
  }
  return 'warning';
}

export function SubscriptionScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<MySubscription | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await getMySubscription());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePay = async (payment: PaymentRecord) => {
    setActingId(payment.id);
    try {
      const res = await initiatePayment(payment.id);
      navigation.navigate('PaymentWebView', {
        url: res.gateway_url,
        mode: 'renew',
        title: 'Complete payment',
      });
    } catch (e) {
      Alert.alert(
        'Could not start payment',
        e instanceof ApiError ? e.message : 'Please try again.',
      );
    } finally {
      setActingId(null);
    }
  };

  const handleInvoice = async (payment: PaymentRecord) => {
    try {
      const { url, headers } = await getInvoiceRequest(payment.id);
      navigation.navigate('InvoiceWebView', {
        url,
        headers,
        title: `Invoice #${payment.id}`,
      });
    } catch {
      Alert.alert('Could not open invoice', 'Please try again.');
    }
  };

  const member = data?.member;
  const pkg = member?.member_package;
  const currency = pkg?.currency ?? '৳';

  return (
    <Screen
      title="My Subscription"
      subtitle="Your membership and payment history"
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load();
      }}>
      {!member ? (
        <EmptyState
          title="No active subscription"
          message="Your membership details will appear here once active."
        />
      ) : (
        <>
          <Card className="mb-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-lg font-bold text-white">
                  {pkg?.name ?? 'Membership'}
                </Text>
                <Text className="mt-0.5 text-sm text-white/55">
                  {member.full_name}
                </Text>
              </View>
              <Badge
                label={member.is_active ? 'Active' : 'Inactive'}
                tone={member.is_active ? 'success' : 'danger'}
              />
            </View>

            {pkg ? (
              <Text className="mt-3 text-2xl font-bold text-brand-400">
                {currency}
                {pkg.price} · {pkg.duration_in_days} days
              </Text>
            ) : null}

            <View className="mt-4 gap-2">
              <Row label="Start date" value={formatDate(member.start_date)} />
              <Row label="End date" value={formatDate(member.end_date)} />
              {typeof member.remaining_days === 'number' ? (
                <Row label="Remaining" value={`${member.remaining_days} days`} />
              ) : null}
              {member.payment_status ? (
                <Row label="Payment status" value={member.payment_status} />
              ) : null}
            </View>
          </Card>

          <Text className="mb-3 text-sm font-semibold text-white/80">
            Payment history
          </Text>
          {!data?.payments || data.payments.length === 0 ? (
            <EmptyState title="No payments yet" />
          ) : (
            <View className="gap-3">
              {data.payments.map(payment => {
                const paid = isPaid(payment);
                return (
                  <Card key={payment.id}>
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-base font-semibold text-white">
                          {currency}
                          {payment.amount}
                        </Text>
                        <Text className="mt-0.5 text-xs text-white/55">
                          {formatDate(payment.paid_at ?? payment.created_at)}
                          {payment.payment_method ? ` • ${payment.payment_method}` : ''}
                        </Text>
                      </View>
                      <Badge
                        label={payment.payment_status || payment.status || 'Pending'}
                        tone={paymentTone(payment)}
                      />
                    </View>

                    <View className="mt-3 flex-row" style={{ gap: 10 }}>
                      {paid ? (
                        <Pressable
                          onPress={() => handleInvoice(payment)}
                          className="flex-1 items-center rounded-2xl border border-white/15 bg-white/5 py-3">
                          <Text className="text-sm font-semibold text-white">
                            View invoice
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          disabled={actingId === payment.id}
                          onPress={() => handlePay(payment)}
                          className="flex-1 items-center rounded-2xl bg-brand-400 py-3">
                          <Text className="text-sm font-semibold text-ink-950">
                            {actingId === payment.id ? 'Starting…' : 'Pay now'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-white/55">{label}</Text>
      <Text className="text-sm font-medium text-white">{value}</Text>
    </View>
  );
}
