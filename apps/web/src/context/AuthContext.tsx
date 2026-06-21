import axios from 'axios';
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'USER' | 'REVIEWER' | 'ADMIN';
  xp: number;
  rating: number;
};

type AuthContextValue = {
  user: User | null;
  isAuthReady: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  loadUser: () => Promise<User | null>;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function clearStoredSession() {
  localStorage.removeItem('codequest.accessToken');
  localStorage.removeItem('codequest.refreshToken');
  localStorage.removeItem('codequest.user');
}

function shouldRestoreSessionOnLoad() {
  return window.location.pathname !== '/oauth/callback';
}

function normalizeUser(data: User | { user: User }) {
  return 'user' in data ? data.user : data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadUserPromiseRef = useRef<Promise<User | null> | null>(null);

  const loadUser = useCallback(async () => {
    if (!loadUserPromiseRef.current) {
      setLoading(true);

      loadUserPromiseRef.current = api
        .get<User | { user: User }>('/auth/me', {
          headers: { 'Cache-Control': 'no-cache' },
          skipAuthExpiredHandler: true,
        })
        .then(({ data }) => {
          const currentUser = normalizeUser(data);
          setUser(currentUser);
          return currentUser;
        })
        .catch(() => {
          clearStoredSession();
          setUser(null);
          return null;
        })
        .finally(() => {
          loadUserPromiseRef.current = null;
          setLoading(false);
          setIsAuthReady(true);
        });
    }

    return loadUserPromiseRef.current;
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!shouldRestoreSessionOnLoad()) {
        if (active) {
          setLoading(false);
          setIsAuthReady(true);
        }
        return;
      }

      try {
        await loadUser();
      } catch {
        if (active) {
          clearStoredSession();
          setUser(null);
          setLoading(false);
          setIsAuthReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [loadUser]);

  useEffect(() => {
    const handleExpiredSession = () => {
      clearStoredSession();
      setUser(null);
      setIsAuthReady(true);
    };
    window.addEventListener('codequest:session-expired', handleExpiredSession);
    return () =>
      window.removeEventListener(
        'codequest:session-expired',
        handleExpiredSession,
      );
  }, []);

  async function persistSession(
    path: '/auth/login' | '/auth/register',
    payload: Record<string, string>,
  ) {
    try {
      const { data } = await api.post<{
        user: User;
      }>(path, payload);
      setUser(data.user);
      setIsAuthReady(true);
      setLoading(false);
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

        throw new Error(
          apiMessage ?? 'Não foi possível concluir a autenticação.',
        );
      }

      throw error;
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login: (email, password) =>
        persistSession('/auth/login', { email, password }),
      loginWithGoogle: () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
      },
      register: (name, email, password) =>
        persistSession('/auth/register', { name, email, password }),
      loadUser,
      refreshUser: loadUser,
      logout: async () => {
        try {
          await api.post('/auth/logout', {}, { skipAuthExpiredHandler: true });
        } catch {
          // Local cleanup still needs to happen if the session is already gone.
        }
        clearStoredSession();
        setUser(null);
        setLoading(false);
        setIsAuthReady(true);
      },
      isAuthReady,
    }),
    [isAuthReady, loadUser, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
