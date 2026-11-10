export const EVENT_CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Other'
];

export const DEFAULT_VENUE_PRESETS = [
  { name: 'Sir M. Visvesvaraya Auditorium', capacity: 850 },
  { name: 'CSE Innovation & Hackathon Lab', capacity: 120 },
  { name: 'Dr. Premachandra Sagar Seminar Hall', capacity: 300 },
  { name: 'Harohalli Athletics Complex & Central Turf', capacity: 1500 },
  { name: 'School of Design Creative Studio', capacity: 80 },
  { name: 'Harohalli Open-Air Amphitheater', capacity: 500 }
];

export const formatDateTimeForInput = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

