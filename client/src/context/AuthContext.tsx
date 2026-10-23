import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, resetCsrf } from '../lib/api';

type Admin = { id: number; username: string };

type AuthState = {
  admin: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await api.get<{ authenticated: boolean; admin: Admin }>('/api/me');
      setAdmin(data.authenticated ? data.admin : null);
    } catch {
      setAdmin(null);
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function login(username: string, password: string) {
    const data = await api.post<{ ok: boolean; admin: Admin }>('/api/login', { username, password });
    setAdmin(data.admin);
  }

  async function logout() {
    await api.post('/api/logout');
    resetCsrf();
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
