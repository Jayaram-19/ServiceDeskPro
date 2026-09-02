import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Restore session on app load
  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const register = async (userData) => {
    return api.post('/auth/register', userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

