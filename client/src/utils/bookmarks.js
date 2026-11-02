const STORAGE_KEY = 'dsu_saved_events';

export function getSavedEventIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isEventSaved(eventId) {
  if (!eventId) return false;
  const ids = getSavedEventIds();
  return ids.includes(eventId);
}

export function toggleSaveEvent(eventId) {
  if (!eventId) return false;
  const ids = getSavedEventIds();
  const exists = ids.includes(eventId);
  let updated;
  if (exists) {
    updated = ids.filter((id) => id !== eventId);
  } else {
    updated = [...ids, eventId];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage write error
  }
  // Dispatch custom storage event so other components update synchronously
  window.dispatchEvent(new Event('dsu-bookmarks-updated'));
  return !exists; // returns true if now saved, false if removed
}

