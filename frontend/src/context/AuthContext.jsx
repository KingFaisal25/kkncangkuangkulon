import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const getTokenKey = () => window.location.pathname.startsWith('/admin') ? 'admin_token' : 'token';
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(getTokenKey()));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      authService
        .getUser()
        .then((data) => {
          setUser(data.data?.user || data.user || data);
        })
        .catch(() => {
          // Token invalid
          localStorage.removeItem(getTokenKey());
          localStorage.removeItem('user'); // if used
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (nim, password) => {
    const response = await authService.login(nim, password);
    const tkn = response.data?.token || response.data?.access_token;
    localStorage.setItem('token', tkn);
    setToken(tkn);
    setUser(response.data?.user);
    return response;
  }, []);

  const adminLogin = useCallback(async (nim, password) => {
    const response = await authService.adminLogin(nim, password);
    const tkn = response.data?.token || response.data?.access_token;
    localStorage.setItem('admin_token', tkn);
    setToken(tkn);
    setUser(response.data?.user);
    return response;
  }, []);

  const register = useCallback(async (formData) => {
    const response = await authService.register(formData);
    // Tidak auto-login sesuai request
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem(getTokenKey());
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      adminLogin,
      register,
      logout,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'admin' || user?.is_admin === true,
    }),
    [user, token, loading, login, adminLogin, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
