/**
 * Pure functions for event filtering, formatting, and parameter serialization.
 */

export function cleanEventTitle(title) {
  if (!title) return '';
  return title.replace(/^DEMO:\s*/i, '').trim();
}

export function formatEventDateTime(isoString) {
  if (!isoString) return { dateStr: '', timeStr: '', month: '', day: '', fullFormatted: '' };
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    return { dateStr: '', timeStr: '', month: '', day: '', fullFormatted: '' };
  }

  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = d.toLocaleDateString('en-US', { day: '2-digit' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return {
    dateStr,
    timeStr,
    month,
    day,
    fullFormatted: `${dateStr} • ${timeStr}`
  };
}

export function getEventRegistrationStatus(event, now = new Date()) {
  if (!event) return { isOpen: false, label: 'Unavailable', variant: 'neutral' };

  if (event.status === 'cancelled') {
    return { isOpen: false, label: 'Cancelled', variant: 'danger' };
  }
  if (event.status === 'completed') {
    return { isOpen: false, label: 'Past Event', variant: 'neutral' };
  }

  const starts = new Date(event.startsAt);
  const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : starts;

  if (now > starts) {
    return { isOpen: false, label: 'Completed', variant: 'neutral' };
  }

  if (now > deadline) {
    return { isOpen: false, label: 'Registration Closed', variant: 'warning' };
  }

  const registered = event.registeredCount ?? 0;
  const capacity = event.capacity ?? 0;
  const seatsLeft = Math.max(0, capacity - registered);

  if (capacity > 0 && seatsLeft <= 0) {
    return { isOpen: false, label: 'Sold Out', variant: 'danger' };
  }

  if (seatsLeft <= 10 && seatsLeft > 0) {
    return { isOpen: true, label: `Only ${seatsLeft} left!`, variant: 'warning', seatsLeft };
  }

  return { isOpen: true, label: `${seatsLeft} seats open`, variant: 'success', seatsLeft };
}

export function buildEventQueryParams({ page = 1, limit = 12, search, category, school, venue, from, to, sort }) {
  const params = { page, limit };
  if (search && search.trim()) params.search = search.trim();
  if (category && category !== 'All' && category !== 'Saved') params.category = category;
  if (school && school.trim()) params.school = school.trim();
  if (venue && venue.trim()) params.venue = venue.trim();
  if (from) params.from = from;
  if (to) params.to = `${to.slice(0, 10)}T23:59:59.999`;
  if (sort && sort !== 'soonest') params.sort = sort;
  return params;
}

