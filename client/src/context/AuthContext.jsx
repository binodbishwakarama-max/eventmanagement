import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dsu_token') || null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to restore session:', err);
        setToken(null);
        localStorage.removeItem('dsu_token');
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;
    localStorage.setItem('dsu_token', receivedToken);
    localStorage.setItem('dsu_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    toast.success(`Welcome back, ${receivedUser.name}!`);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data.data;
    localStorage.setItem('dsu_token', receivedToken);
    localStorage.setItem('dsu_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    toast.success('Registration successful!');
    return receivedUser;
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const refreshed = res.data.data;
      setUser(refreshed);
      localStorage.setItem('dsu_user', JSON.stringify(refreshed));
      return refreshed;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem('dsu_token');
      localStorage.removeItem('dsu_user');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isBootstrapping, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

