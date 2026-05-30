import { api } from '../lib/apiClient';
import {
  clearAuth,
  setSchema,
  setStoredUser,
  setSubdomain,
  setTokens,
  type StoredUser,
} from '../lib/storage';

export type TenantInfo = {
  id: number;
  name: string;
  schema_name: string;
  domain?: string | null;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  tenant: TenantInfo;
  redirect_url?: string;
};

export type CurrentUser = {
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  is_tenant_admin: boolean;
  permissions: Record<string, boolean>;
  enabled_features: string[];
};

/**
 * Tenant member login. The subdomain identifies which gym (tenant schema) the
 * member belongs to and is stored for subsequent tenant-routed requests.
 */
export async function login(
  email: string,
  password: string,
  subdomain: string,
): Promise<LoginResponse> {
  const normalizedSubdomain = subdomain.trim().toLowerCase();
  // Persist the subdomain first so the request carries the tenant hint header.
  await setSubdomain(normalizedSubdomain);

  const data = await api.post<LoginResponse>(
    '/tenancy/auth/login/',
    { email: email.trim(), password, subdomain: normalizedSubdomain },
    { skipAuth: true, subdomain: normalizedSubdomain },
  );

  await setTokens(data.access, data.refresh);
  if (data.tenant?.schema_name) {
    await setSchema(data.tenant.schema_name);
  }
  return data;
}

/** Fetch the authenticated member's profile, role, permissions and features. */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  const me = await api.get<CurrentUser>('/access/me/');
  const stored: StoredUser = {
    id: me.user_id,
    email: me.email,
    full_name: me.full_name,
    role: me.role,
    is_tenant_admin: me.is_tenant_admin,
  };
  await setStoredUser(stored);
  return me;
}

export async function logout(): Promise<void> {
  await clearAuth();
  await setStoredUser(null);
}
