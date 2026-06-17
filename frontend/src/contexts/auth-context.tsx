'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/services/api';

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('@mvp:token');
    localStorage.removeItem('@mvp:user');
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const data = await authApi.login(email, senha);
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('@mvp:token', data.accessToken);
    localStorage.setItem('@mvp:user', JSON.stringify(data.user));
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('@mvp:token');
    const storedUser = localStorage.getItem('@mvp:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      authApi.me()
        .then((u) => {
          setUser(u);
          localStorage.setItem('@mvp:user', JSON.stringify(u));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
