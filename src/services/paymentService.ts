import { api } from '../lib/apiClient';
import { API_BASE_URL } from '../config/env';
import { getAccessToken, getSubdomain } from '../lib/storage';

export type PaymentGateway = {
  slug: string;
  name: string;
  is_configured: boolean;
};

export type InitiatePaymentResponse = {
  gateway_url: string;
  tran_id: string;
};

/** Payment gateways configured for the tenant. */
export async function getAvailableGateways(): Promise<PaymentGateway[]> {
  return api.get<PaymentGateway[]>('/billing/payments/available-gateways/');
}

/** Start a gateway session to settle an outstanding payment. */
export async function initiatePayment(
  paymentId: number,
  gatewaySlug = 'sslcommerz',
): Promise<InitiatePaymentResponse> {
  return api.post<InitiatePaymentResponse>('/billing/payments/initiate/', {
    payment_id: paymentId,
    gateway_slug: gatewaySlug,
  });
}

/**
 * Absolute URL + auth headers for opening a payment invoice PDF in a WebView
 * or passing to a download handler.
 */
export async function getInvoiceRequest(
  paymentId: number,
  download = false,
): Promise<{ url: string; headers: Record<string, string> }> {
  const token = await getAccessToken();
  const subdomain = await getSubdomain();
  const query = download ? '?download=1' : '';
  return {
    url: `${API_BASE_URL}/billing/payments/${paymentId}/invoice/${query}`,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(subdomain ? { 'X-Tenant-Subdomain': subdomain } : {}),
    },
  };
}
