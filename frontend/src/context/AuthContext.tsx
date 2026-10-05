import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/library';
import { setUnauthorizedHandler, tokenStorage } from '../api/http';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login({ username, password });
    tokenStorage.set(res.token);
    setToken(res.token);
  }, []);

  // If any protected call returns 401 (e.g. token expired after 1h) -> log out
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(() => ({ isAuthenticated: token !== null, login, logout }), [token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
