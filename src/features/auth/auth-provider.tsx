'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from './auth-service';
import type { AuthenticatedUser, LoginInput, RegisterInput } from './types';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: Status;
  user: AuthenticatedUser | null;
  login(input: LoginInput): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  logout(): Promise<void>;
  /**
   * Patches the signed-in user's own client-side state — used by Account
   * Settings after a profile save so the topbar and Dashboard greeting reflect
   * the new name/email immediately. Purely local: it does not call
   * `authService` and is not persisted across a reload, since `AuthService`
   * has no profile-update endpoint yet. A backend-backed profile update would
   * replace this with a real session refresh.
   */
  updateUser(patch: Partial<AuthenticatedUser>): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the current session for the app shell. It delegates every operation to
 * `authService`, so replacing the mock with the real API changes nothing here.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let active = true;
    authService
      .getSession()
      .then((session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setStatus(session ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus('anonymous');
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const session = await authService.login(input);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authService.register(input);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const updateUser = useCallback((patch: Partial<AuthenticatedUser>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, updateUser }),
    [status, user, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
