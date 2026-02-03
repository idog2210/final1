import React, { createContext, useContext, useEffect, useState } from 'react';
import { me } from '../api/auth.api';
import { User } from '../types';

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setAuth = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    if (!localStorage.getItem('token')) return;
    const data = await me();
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          await refreshMe();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value: AuthState = {
    token,
    user,
    isLoading,
    setAuth,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
