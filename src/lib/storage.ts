import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'fitssort.access';
const REFRESH_KEY = 'fitssort.refresh';
const USER_KEY = 'fitssort.user';
const SUBDOMAIN_KEY = 'fitssort.subdomain';
const SCHEMA_KEY = 'fitssort.schema';

export type StoredUser = {
  id: number;
  email: string;
  full_name?: string;
  role?: string;
  is_tenant_admin?: boolean;
};

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function setTokens(access: string, refresh?: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_KEY, access);
  if (refresh) {
    await AsyncStorage.setItem(REFRESH_KEY, refresh);
  }
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: StoredUser | null): Promise<void> {
  if (user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(USER_KEY);
  }
}

export async function getSubdomain(): Promise<string | null> {
  return AsyncStorage.getItem(SUBDOMAIN_KEY);
}

export async function setSubdomain(subdomain: string): Promise<void> {
  await AsyncStorage.setItem(SUBDOMAIN_KEY, subdomain.trim().toLowerCase());
}

export async function getSchema(): Promise<string | null> {
  return AsyncStorage.getItem(SCHEMA_KEY);
}

export async function setSchema(schema: string): Promise<void> {
  await AsyncStorage.setItem(SCHEMA_KEY, schema);
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeMany([ACCESS_KEY, REFRESH_KEY, USER_KEY, SCHEMA_KEY]);
  // Intentionally keep the subdomain so the login screen can pre-fill it.
}
