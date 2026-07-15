import { API_BASE_URL } from '../config/env';
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getSubdomain,
  setTokens,
} from './storage';

const REFRESH_PATH = '/identity/refresh/';
const REFRESH_LEAD_SECONDS = 60;

let refreshPromise: Promise<string | null> | null = null;
let proactiveTimer: ReturnType<typeof setTimeout> | null = null;

type RefreshResponse = {
  access: string;
  refresh?: string;
};

function parseJwtPayload(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

function isJwtExpired(token: string | null, skewSeconds = 5): boolean {
  if (!token) return true;
  const payload = parseJwtPayload(token);
  if (typeof payload?.exp !== 'number') return true;
  return payload.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}

function accessExpiresInSeconds(token: string | null): number | null {
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (typeof payload?.exp !== 'number') return null;
  return payload.exp - Math.floor(Date.now() / 1000);
}

export function clearRefreshSchedule(): void {
  if (proactiveTimer !== null) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
}

export function scheduleProactiveRefresh(): void {
  clearRefreshSchedule();
  void (async () => {
    const access = await getAccessToken();
    const refresh = await getRefreshToken();
    if (!access || !refresh) return;

    const secondsLeft = accessExpiresInSeconds(access);
    if (secondsLeft === null) return;

    const delayMs = Math.max((secondsLeft - REFRESH_LEAD_SECONDS) * 1000, 0);
    proactiveTimer = setTimeout(() => {
      proactiveTimer = null;
      void refreshAccessToken().then((token) => {
        if (token) scheduleProactiveRefresh();
      });
    }, delayMs);
  })();
}

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  if (refreshPromise) return refreshPromise;

  const refreshAtStart = refresh;

  refreshPromise = (async () => {
    try {
      const subdomain = await getSubdomain();
      const res = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(subdomain ? { 'X-Tenant-Subdomain': subdomain } : {}),
        },
        body: JSON.stringify({ refresh: refreshAtStart }),
      });
      if (!res.ok) {
        await clearAuth();
        return null;
      }
      const data = (await res.json()) as RefreshResponse;
      const currentRefresh = await getRefreshToken();
      if (!currentRefresh || currentRefresh !== refreshAtStart) {
        return null;
      }
      await setTokens(data.access, data.refresh ?? refreshAtStart);
      scheduleProactiveRefresh();
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

export async function ensureValidAccessToken(): Promise<string | null> {
  const access = await getAccessToken();
  const refresh = await getRefreshToken();
  if (!refresh) return access;

  if (!access || isJwtExpired(access, REFRESH_LEAD_SECONDS)) {
    return refreshAccessToken();
  }
  return access;
}
