import { api } from '../lib/apiClient';

export type MemberPackage = {
  id: number;
  name: string;
  price: number | string;
  duration_in_days: number;
  package_type?: string;
  description?: string;
  currency?: string;
};

export type PaymentRecord = {
  id: number;
  amount: number | string;
  payment_method?: string;
  payment_status: string;
  status?: string;
  created_at?: string;
  paid_at?: string | null;
  transaction_id?: string | null;
  currency?: string;
};

export type MyMember = {
  id: number;
  full_name: string;
  phone_number?: string;
  email?: string;
  member_package?: MemberPackage | null;
  start_date?: string | null;
  end_date?: string | null;
  remaining_days?: number;
  payment_method?: string;
  payment_status?: string;
  is_active?: boolean;
  branch?: number | null;
  branch_name?: string | null;
};

export type MySubscription = {
  member: MyMember;
  payments: PaymentRecord[];
};

export type RegisterCheckoutResponse = {
  message?: string;
  member_id?: number;
  invitation_sent?: boolean;
  invite_url?: string;
  gateway_url?: string;
  tran_id?: string;
};

export type RegisterPayload = {
  full_name: string;
  phone_number: string;
  email: string;
  member_package_id: number;
  gatewaySlug?: string;
  branch_id?: number | null;
};

/** Public list of purchasable packages for the tenant (no auth required). */
export async function getPublicPackages(): Promise<MemberPackage[]> {
  return api.get<MemberPackage[]>('/membership/public/packages/', { skipAuth: true });
}

/**
 * Member self-registration with SSLCommerz checkout. Returns a gateway_url to
 * be opened in a WebView to complete payment.
 */
export async function registerAndCheckout(
  payload: RegisterPayload,
): Promise<RegisterCheckoutResponse> {
  return api.post<RegisterCheckoutResponse>(
    '/membership/public/register/',
    {
      full_name: payload.full_name.trim(),
      phone_number: payload.phone_number.trim(),
      email: payload.email.trim(),
      member_package_id: payload.member_package_id,
      membership_type: 'package',
      start_checkout: true,
      gateway_slug: payload.gatewaySlug ?? 'sslcommerz',
      ...(payload.branch_id != null ? { branch_id: payload.branch_id } : {}),
    },
    { skipAuth: true },
  );
}

/** Authenticated member's current subscription + payment history. */
export async function getMySubscription(): Promise<MySubscription> {
  return api.get<MySubscription>('/membership/my-subscription/');
}
