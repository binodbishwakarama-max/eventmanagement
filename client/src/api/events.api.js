import { apiClient } from './client.js';
import { AppApiError } from './errors.js';

export async function fetchEvents(params = {}) {
  try {
    const res = await apiClient.get('/events', { params });
    return {
      items: res.data?.data?.items || [],
      total: res.data?.data?.total || 0,
      totalPages: res.data?.data?.totalPages || 1,
      page: res.data?.data?.page || 1
    };
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function fetchEventById(id) {
  try {
    const res = await apiClient.get(`/events/${id}`);
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function createEvent(eventData) {
  try {
    const res = await apiClient.post('/events', eventData);
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function updateEvent(id, eventData) {
  try {
    const res = await apiClient.put(`/events/${id}`, eventData);
    return res.data?.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function deleteEvent(id) {
  try {
    const res = await apiClient.delete(`/events/${id}`);
    return res.data;
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function fetchVenues() {
  try {
    const res = await apiClient.get('/venues');
    return res.data?.data || [];
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

export async function fetchClubs() {
  try {
    const res = await apiClient.get('/clubs');
    return res.data?.data || [];
  } catch (err) {
    throw AppApiError.fromAxiosError(err);
  }
}

