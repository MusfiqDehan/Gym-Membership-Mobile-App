import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  getMyShiftRequests,
  getPublicBranches,
  requestBranchShift,
  type BranchMinimal,
  type BranchShiftRequest,
  type ShiftRequestStatus,
} from '../../services/branchService';
import { ApiError } from '../../lib/apiClient';
import { colors } from '../../theme/colors';
import { formatDate } from '../../lib/format';

const STATUS_TONE: Record<ShiftRequestStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
};

type Props = {
  memberId: number;
  currentBranchName?: string | null;
};

export function BranchShiftCard({ memberId, currentBranchName }: Props) {
  const [branches, setBranches] = useState<BranchMinimal[]>([]);
  const [requests, setRequests] = useState<BranchShiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toBranch, setToBranch] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [branchList, requestList] = await Promise.all([
        getPublicBranches(),
        getMyShiftRequests(memberId),
      ]);
      setBranches(branchList);
      setRequests(requestList);
    } catch {
      setBranches([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const hasPending = requests.some(r => r.status === 'pending');

  const handleSubmit = async () => {
    if (!toBranch) {
      Alert.alert('Select a branch', 'Please choose the branch you want to move to.');
      return;
    }
    setSubmitting(true);
    try {
      await requestBranchShift({ member: memberId, to_branch: toBranch, reason });
      setShowForm(false);
      setToBranch(null);
      setReason('');
      await load();
      Alert.alert('Request submitted', 'Your branch shift request is awaiting review.');
    } catch (e) {
      Alert.alert(
        'Could not submit request',
        e instanceof ApiError ? e.message : 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-white">My Branch</Text>
        {!showForm ? (
          <Pressable
            disabled={hasPending}
            onPress={() => setShowForm(true)}
            className={`rounded-full border px-4 py-2 ${
              hasPending ? 'border-white/10 bg-white/5 opacity-60' : 'border-brand-400 bg-brand-400/15'
            }`}>
            <Text
              className={`text-sm font-semibold ${
                hasPending ? 'text-white/50' : 'text-brand-300'
              }`}>
              Request shift
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-sm text-white/55">Current branch</Text>
        <Text className="text-sm font-medium text-white">
          {currentBranchName ?? 'Unassigned'}
        </Text>
      </View>

      {hasPending && !showForm ? (
        <Text className="mt-3 text-xs text-warning">
          You already have a pending request. You can submit a new one once it is reviewed.
        </Text>
      ) : null}

      {showForm ? (
        <View className="mt-4">
          <Text className="mb-2 text-sm text-white/70">Target branch</Text>
          {branches.length === 0 ? (
            <Text className="text-sm text-white/45">No other branches are available.</Text>
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {branches.map(b => {
                const selected = toBranch === b.id;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => setToBranch(b.id)}
                    className={`rounded-full border px-4 py-2 ${
                      selected
                        ? 'border-brand-400 bg-brand-400/15'
                        : 'border-white/15 bg-white/5'
                    }`}>
                    <Text
                      className={`text-sm ${
                        selected ? 'font-semibold text-brand-300' : 'text-white/75'
                      }`}>
                      {b.name}
                      {b.city ? ` — ${b.city}` : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text className="mt-4 mb-2 text-sm text-white/70">Reason (optional)</Text>
          <TextInput
            placeholder="Tell us why you'd like to shift branches…"
            placeholderTextColor={colors.textFaint}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="min-h-20 rounded-2xl border border-white/12 bg-ink-800 px-4 py-3 text-base text-white"
          />

          <View className="mt-4 flex-row" style={{ gap: 10 }}>
            <View className="flex-1">
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowForm(false);
                  setToBranch(null);
                  setReason('');
                }}
              />
            </View>
            <View className="flex-1">
              <Button title="Submit" loading={submitting} onPress={handleSubmit} />
            </View>
          </View>
        </View>
      ) : null}

      <Text className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">
        Request history
      </Text>
      {loading ? (
        <ActivityIndicator color={colors.brand} size="small" />
      ) : requests.length === 0 ? (
        <Text className="text-sm text-white/45">No shift requests yet.</Text>
      ) : (
        <View className="gap-3">
          {requests.map(r => (
            <View
              key={r.id}
              className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-medium text-white">
                  {r.from_branch_name ?? 'Unassigned'} → {r.to_branch_name ?? '—'}
                </Text>
                <Text className="mt-0.5 text-xs text-white/45">
                  {formatDate(r.created_at)}
                  {r.decision_note ? ` • ${r.decision_note}` : ''}
                </Text>
              </View>
              <Badge label={r.status} tone={STATUS_TONE[r.status]} />
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
