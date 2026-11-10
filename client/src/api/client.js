import axios from 'axios';
import { env } from '../config/env.js';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('dsu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Failed reading token from localStorage', err);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      localStorage.removeItem('dsu_token');
      localStorage.removeItem('dsu_user');
    }
    return Promise.reject(error);
  }
);
