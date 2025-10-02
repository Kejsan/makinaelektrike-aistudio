import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

export interface AuthUser {
  email: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = 'authUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setInitializing(false);
      return;
    }

    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to load stored auth session', err);
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail === 'admin@example.com' && password === 'admin123') {
          setUser({ email: normalizedEmail, token: 'mock-admin-token' });
          setLoading(false);
          resolve();
        } else {
          const message = 'Invalid email or password';
          setError(message);
          setLoading(false);
          reject(new Error(message));
        }
      }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      initializing,
      error,
      login,
      logout,
    }),
    [user, loading, initializing, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
