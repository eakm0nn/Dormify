import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { setApiToken } from '../services/api';
import type { AuthResult, LoginResponse, PublicUser, RegisterInput } from '../types/api';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const authError = (error: unknown, fallback: string) =>
  axios.isAxiosError<{ error?: string }>(error)
    ? error.response?.data?.error || fallback
    : fallback;
const isUnauthorized = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setApiToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const token = localStorage.getItem('token');
      // Cached roles are never trusted, including malformed/forged JSON.
      localStorage.removeItem('user');
      setApiToken(token);
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<{ user: PublicUser }>('/api/auth/me');
        if (active && localStorage.getItem('token') === token) setUser(res.data.user);
      } catch (error) {
        if (active && localStorage.getItem('token') === token) {
          if (isUnauthorized(error)) clearSession();
          else setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const current = localStorage.getItem('token');
        if (
          isUnauthorized(error) &&
          current &&
          error.config?.headers?.Authorization === 'Bearer ' + current
        )
          clearSession();
        return Promise.reject(error);
      },
    );
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'token' || event.key === null) {
        setUser(null);
        setLoading(true);
        restore();
      }
    };
    restore();
    window.addEventListener('storage', onStorage);
    return () => {
      active = false;
      api.interceptors.response.eject(interceptor);
      window.removeEventListener('storage', onStorage);
    };
  }, [clearSession]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password });
      localStorage.removeItem('user');
      localStorage.setItem('token', res.data.token);
      setApiToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: authError(error, 'Login failed') };
    }
  };
  const register = async (userData: RegisterInput): Promise<AuthResult> => {
    try {
      await api.post('/api/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: authError(error, 'Registration failed') };
    }
  };
  const logout = async (): Promise<AuthResult> => {
    try {
      await api.post('/api/auth/logout');
      clearSession();
      return { success: true };
    } catch (error) {
      if (isUnauthorized(error)) {
        clearSession();
        return { success: true };
      }
      return { success: false, error: 'Sign out failed. Please try again.' };
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
