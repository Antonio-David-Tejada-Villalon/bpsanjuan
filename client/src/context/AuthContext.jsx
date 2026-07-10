import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [publicUser, setPublicUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { user } = await authApi.getMe();
        setUser(user);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      }
    }

    const publicRaw = localStorage.getItem('publicUser');
    if (publicRaw) {
      try {
        setPublicUser(JSON.parse(publicRaw));
      } catch {
        localStorage.removeItem('publicUser');
        localStorage.removeItem('publicToken');
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const setPublicSession = (token, publicUserData) => {
    localStorage.setItem('publicToken', token);
    localStorage.setItem('publicUser', JSON.stringify(publicUserData));
    setPublicUser(publicUserData);
  };

  const logoutPublic = () => {
    localStorage.removeItem('publicToken');
    localStorage.removeItem('publicUser');
    setPublicUser(null);
  };

  const value = {
    user,
    setUser,
    publicUser,
    setPublicSession,
    logoutPublic,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
