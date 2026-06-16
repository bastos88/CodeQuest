import axios from 'axios';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'REVIEWER' | 'ADMIN';
  xp: number;
  rating: number;
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  persistOAuthSession: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function clearStoredSession() {
  localStorage.removeItem('codequest.accessToken');
  localStorage.removeItem('codequest.refreshToken');
  localStorage.removeItem('codequest.user');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('codequest.user');
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      clearStoredSession();
      return null;
    }
  });

  useEffect(() => {
    const handleExpiredSession = () => setUser(null);
    window.addEventListener('codequest:session-expired', handleExpiredSession);
    return () => window.removeEventListener('codequest:session-expired', handleExpiredSession);
  }, []);

  async function persistSession(path: '/auth/login' | '/auth/register', payload: Record<string, string>) {
    try {
      const { data } = await api.post<{ user: User; accessToken: string; refreshToken: string }>(path, payload);
      localStorage.setItem('codequest.accessToken', data.accessToken);
      localStorage.setItem('codequest.refreshToken', data.refreshToken);
      localStorage.setItem('codequest.user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.message;

        if (status === 409) {
          throw new Error(apiMessage ?? 'Este email já está em uso.');
        }

        if (status === 401) {
          throw new Error(apiMessage ?? 'Email ou senha inválidos.');
        }

        throw new Error(apiMessage ?? 'Não foi possível concluir a autenticação.');
      }

      throw error;
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (email, password) => persistSession('/auth/login', { email, password }),
      register: (name, email, password) => persistSession('/auth/register', { name, email, password }),
      persistOAuthSession: async (accessToken, refreshToken) => {
        localStorage.setItem('codequest.accessToken', accessToken);
        localStorage.setItem('codequest.refreshToken', refreshToken);
        const { data } = await api.get<User>('/auth/me');
        localStorage.setItem('codequest.user', JSON.stringify(data));
        setUser(data);
      },
      logout: () => {
        clearStoredSession();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
