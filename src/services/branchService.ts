import { api } from '../lib/apiClient';

export type BranchMinimal = {
  id: number;
  name: string;
  city: string;
  address: string;
};

export type ShiftRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type BranchShiftRequest = {
  id: number;
  member: number | null;
  member_name: string | null;
  trainer: number | null;
  trainer_name: string | null;
  from_branch: number | null;
  from_branch_name: string | null;
  to_branch: number;
  to_branch_name: string | null;
  status: ShiftRequestStatus;
  reason: string;
  decision_note: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ShiftRequestPayload = {
  member: number;
  to_branch: number;
  reason?: string;
};

function asList<T>(data: T[] | { results?: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

/** Public, non-feature-gated branch list used by the member branch picker. */
export async function getPublicBranches(): Promise<BranchMinimal[]> {
  return api
    .get<BranchMinimal[] | { results?: BranchMinimal[] }>(
      '/branch/public/branches/minimal/',
    )
    .then(asList);
}

/** The authenticated member's own branch-shift requests. */
export async function getMyShiftRequests(
  memberId: number,
): Promise<BranchShiftRequest[]> {
  return api
    .get<
      BranchShiftRequest[] | { results?: BranchShiftRequest[] }
    >(`/branch/shift-requests/me/?member=${memberId}`)
    .then(asList);
}

/** Submit a new branch-shift request for the authenticated member. */
export async function requestBranchShift(
  payload: ShiftRequestPayload,
): Promise<BranchShiftRequest> {
  return api.post<BranchShiftRequest>('/branch/shift-requests/me/', {
    member: payload.member,
    to_branch: payload.to_branch,
    reason: payload.reason?.trim() ?? '',
  });
}
