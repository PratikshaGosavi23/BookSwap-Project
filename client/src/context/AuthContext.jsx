// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('bookswap_theme') === 'dark');

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('bookswap_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('bookswap_token');
    const saved = localStorage.getItem('bookswap_user');
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('bookswap_token', data.token);
    localStorage.setItem('bookswap_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (formData) => {
    const { data } = await api.post('/auth/signup', formData);
    localStorage.setItem('bookswap_token', data.token);
    localStorage.setItem('bookswap_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bookswap_token');
    localStorage.removeItem('bookswap_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('bookswap_user', JSON.stringify(updatedUser));
  }, []);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
