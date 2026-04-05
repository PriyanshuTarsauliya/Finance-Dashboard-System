import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password, turnstileToken) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password, turnstileToken });
      api.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/google', { token: googleToken });
      api.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, dateOfBirth, gender, role = 'VIEWER', turnstileToken) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', { name, email, password, dateOfBirth, gender, role, turnstileToken });
      api.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (phone, countryCode, turnstileToken) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/send-otp', { phone, countryCode, turnstileToken });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone, countryCode, otp, name, dateOfBirth, gender) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/verify-otp', { phone, countryCode, otp, name, dateOfBirth, gender });
      api.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.clearTokens();
    setUser(null);
  };

  const isAuthenticated = !!user && !!api.getToken();

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, sendOtp, verifyOtp, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
