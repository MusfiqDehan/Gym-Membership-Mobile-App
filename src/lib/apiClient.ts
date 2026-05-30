import { API_BASE_URL } from '../config/env';
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getSubdomain,
  setTokens,
} from './storage';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectErrorMessages(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectErrorMessages);
  }
  if (isJsonObject(value)) {
    return Object.values(value).flatMap(collectErrorMessages);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }
  return [];
}

function extractApiErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }
  if (isJsonObject(data)) {
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail.trim();
    }
    const messages = collectErrorMessages(data);
    if (messages.length > 0) {
      return messages[0];
    }
  }
  if (status === 400) {
    return 'Invalid input. Please review the form fields.';
  }
  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  return `Request failed with status ${status}`;
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  skipRefresh?: boolean;
  /** Override the tenant subdomain header (defaults to the stored subdomain). */
  subdomain?: string;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) {
    return null;
  }
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = (async () => {
    try {
      const subdomain = await getSubdomain();
      const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(subdomain ? { 'X-Tenant-Subdomain': subdomain } : {}),
        },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        await clearAuth();
        return null;
      }
      const data = (await res.json()) as { access: string };
      await setTokens(data.access);
      return data.access;
    } catch {
      await clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function buildHeaders(options: RequestOptions): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Tenant routing hint for the hostless mobile client.
  const subdomain = options.subdomain ?? (await getSubdomain());
  if (subdomain) {
    headers['X-Tenant-Subdomain'] = subdomain;
  }

  if (!options.skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    throw new ApiError(extractApiErrorMessage(data, res.status), res.status, data);
  }
  return data as T;
}

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = await buildHeaders(options);

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? (options.body as unknown as BodyInit)
          : JSON.stringify(options.body),
  };

  let res = await fetch(url, init);

  // Silent refresh on 401 once (skipped for auth/refresh endpoints).
  if (res.status === 401 && !options.skipAuth && !options.skipRefresh) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newAccess}` };
      res = await fetch(url, { ...init, headers: retryHeaders });
    }
  }

  return parseResponse<T>(res);
}

export const api = {
  get: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
