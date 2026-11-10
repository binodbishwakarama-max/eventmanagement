import { apiClient } from './client.js';
import { AppApiError } from './errors.js';

export async function loginUser(email, password) {
  try {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function registerStudent(registrationData) {
  try {
    const res = await apiClient.post('/auth/register', registrationData);
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function fetchCurrentUser() {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data?.data?.user;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function requestPasswordReset(email) {
  try {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function resetPasswordWithToken(token, newPassword) {
  try {
    const res = await apiClient.post('/auth/reset-password', { token, newPassword });
    return res.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

