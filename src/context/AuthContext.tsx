import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  type CurrentUser,
} from '../services/authService';
import {
  getAccessToken,
  getStoredUser,
  getSubdomain,
  type StoredUser,
} from '../lib/storage';
import { scheduleProactiveRefresh } from '../lib/tokenRefresh';

type AuthState = {
  initializing: boolean;
  isAuthenticated: boolean;
  user: StoredUser | null;
  currentUser: CurrentUser | null;
  subdomain: string | null;
  login: (email: string, password: string, subdomain: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [subdomain, setSubdomainState] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const me = await fetchCurrentUser();
    setCurrentUser(me);
    setUser({
      id: me.user_id,
      email: me.email,
      full_name: me.full_name,
      role: me.role,
      is_tenant_admin: me.is_tenant_admin,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const storedSubdomain = await getSubdomain();
        if (!cancelled) {
          setSubdomainState(storedSubdomain);
        }
        const token = await getAccessToken();
        if (token) {
          const stored = await getStoredUser();
          if (!cancelled && stored) {
            setUser(stored);
          }
          // Validate the session and hydrate fresh permissions.
          try {
            await refreshUser();
            scheduleProactiveRefresh();
          } catch {
            // Token invalid/expired; treat as logged out.
            await logoutRequest();
            if (!cancelled) {
              setUser(null);
              setCurrentUser(null);
            }
          }
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string, sub: string) => {
      await loginRequest(email, password, sub);
      setSubdomainState(sub.trim().toLowerCase());
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      // Always switch UI to logged-out state, even if storage cleanup fails.
      setUser(null);
      setCurrentUser(null);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      initializing,
      isAuthenticated: !!user,
      user,
      currentUser,
      subdomain,
      login,
      logout,
      refreshUser,
    }),
    [initializing, user, currentUser, subdomain, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
