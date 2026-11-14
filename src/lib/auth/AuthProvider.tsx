'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setTokenWithCookies, clearTokenWithCookies } from './storage';
import { puedeCrearRecursos, puedeEditarRecursoCliente, puedeEliminarRecursoCliente } from '@/lib/utils/multiTenancy.client';

type User = {
  email: string;
  role: 'admin' | 'user';
  nombre?: string;
  subscriptionStatus?: 'trial' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  hasActiveSubscription?: boolean;
  trialExpired?: boolean;
  trialEndDate?: string;
  exemptFromPayments?: boolean;
};

type AuthRequestBody = {
  email: string;
  password: string;
  redirectUrl?: string;
};

type AuthContextType = {
  ready: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string, redirectUrl?: string) => Promise<void>;
  loginDemo: (redirectUrl?: string) => Promise<void>;
  register: (email: string, password: string, redirectUrl?: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: 'admin' | 'user') => boolean;
  canCreateCultivo: () => boolean;
  canDeleteCultivo: (cultivoCreadoPor: string) => boolean;
  canCreateTarea: () => boolean;
  canDeleteTarea: (tareaCreadoPor: string) => boolean;
  canEditRecursos: (recursoCreadoPor: string) => boolean;
  canCreateUsuario: () => boolean;
  canViewUsuarios: () => boolean;
  checkSubscription: () => Promise<boolean>;
  hasActiveSubscription: () => boolean;
  isExemptFromPayments: () => boolean;
};

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [token, setTok] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isVerifying) return;
      const t = getToken();

      if (t) {
        setIsVerifying(true);
        try {
          const response = await fetch('/api/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: t }),
          });

          const data = await response.json();

          if (response.ok && data.valid) {
            setTok(t);
            setUser(data.user);
          } else {
            clearTokenWithCookies();
          }
        } catch {
          clearTokenWithCookies();
        } finally {
          setIsVerifying(false);
        }
      }

      setReady(true);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string, redirectUrl?: string) => {
    if (!email.includes('@')) {
      throw new Error('Email inválido - debe contener @');
    }

    const requestBody: AuthRequestBody = { email, password };
    if (redirectUrl) {
      requestBody.redirectUrl = redirectUrl;
    }

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error de autenticación');
    }

    const { token: newToken, user: userData, redirectTo } = data;
    setTokenWithCookies(newToken);
    setTok(newToken);
    setUser(userData);

    const targetUrl = redirectTo || '/cultivo';
    router.push(targetUrl);
    router.refresh();
  }, [router]);

  const loginDemo = useCallback(async (redirectUrl?: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demo: true, redirectUrl }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'No se pudo iniciar el acceso rápido');
    }

    const { token: newToken, user: userData, redirectTo } = data;
    setTokenWithCookies(newToken);
    setTok(newToken);
    setUser(userData);

    const targetUrl = redirectTo || '/cultivo';
    router.push(targetUrl);
    router.refresh();
  }, [router]);

  const register = useCallback(async (email: string, password: string, redirectUrl?: string) => {
    if (!email.includes('@')) {
      throw new Error('Email inválido - debe contener @');
    }
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const requestBody: AuthRequestBody = { email, password };
    if (redirectUrl) {
      requestBody.redirectUrl = redirectUrl;
    }

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'No se pudo crear la cuenta');
    }

    const { token: newToken, user: userData, redirectTo } = data;
    const userWithSubscription: User = {
      ...userData,
      subscriptionStatus: 'active',
      hasActiveSubscription: true,
      exemptFromPayments: true,
    };

    setTokenWithCookies(newToken);
    setTok(newToken);
    setUser(userWithSubscription);

    const targetUrl = redirectTo || '/cultivo';
    router.push(targetUrl);
    router.refresh();
  }, [router]);

  const logout = useCallback(() => {
    clearTokenWithCookies();
    setTok(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const hasRole = useCallback((role: 'admin' | 'user'): boolean => {
    return user?.role === role;
  }, [user?.role]);

  const canCreateCultivo = useCallback((): boolean => {
    return puedeCrearRecursos(user);
  }, [user]);

  const canDeleteCultivo = useCallback((cultivoCreadoPor: string): boolean => {
    return puedeEliminarRecursoCliente(user, cultivoCreadoPor);
  }, [user]);

  const canCreateTarea = useCallback((): boolean => {
    return puedeCrearRecursos(user);
  }, [user]);

  const canDeleteTarea = useCallback((tareaCreadoPor: string): boolean => {
    return puedeEliminarRecursoCliente(user, tareaCreadoPor);
  }, [user]);

  const canEditRecursos = useCallback((recursoCreadoPor: string): boolean => {
    return puedeEditarRecursoCliente(user, recursoCreadoPor);
  }, [user]);

  const canCreateUsuario = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  const canViewUsuarios = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  const checkSubscription = useCallback(async (): Promise<boolean> => {
    return true;
  }, []);

  const hasActiveSubscription = useCallback((): boolean => {
    return true;
  }, []);

  const isExemptFromPayments = useCallback((): boolean => {
    return true;
  }, []);

  const value = useMemo(
    () => ({
      ready,
      token,
      user,
      login,
      loginDemo,
      register,
      logout,
      hasRole,
      canCreateCultivo,
      canDeleteCultivo,
      canCreateTarea,
      canDeleteTarea,
      canEditRecursos,
      canCreateUsuario,
      canViewUsuarios,
      checkSubscription,
      hasActiveSubscription,
      isExemptFromPayments
    }),
    [
      ready,
      token,
      user,
      login,
      loginDemo,
      register,
      logout,
      hasRole,
      canCreateCultivo,
      canDeleteCultivo,
      canCreateTarea,
      canDeleteTarea,
      canEditRecursos,
      canCreateUsuario,
      canViewUsuarios,
      checkSubscription,
      hasActiveSubscription,
      isExemptFromPayments
    ]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
