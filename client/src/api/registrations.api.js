import { apiClient } from './client.js';
import { AppApiError } from './errors.js';

export async function registerForEvent(eventId) {
  try {
    const res = await apiClient.post('/registrations', { eventId });
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function fetchMyRegistrations() {
  try {
    const res = await apiClient.get('/registrations/me');
    return res.data?.data || [];
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function cancelRegistration(registrationId) {
  try {
    const res = await apiClient.patch(`/registrations/${registrationId}/cancel`);
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function verifyPass(ticketCode) {
  try {
    const res = await apiClient.post('/registrations/verify-pass', { ticketCode });
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function checkInPass(ticketCode) {
  try {
    const res = await apiClient.post('/registrations/checkin', { ticketCode });
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

