/**
 * Generates an RFC 5545 compliant iCalendar (.ics) file and triggers browser download.
 * Compatible with Apple Calendar (macOS, iOS), Microsoft Outlook, and standard calendar apps.
 */
export function downloadIcsFile(event) {
  if (!event) return;

  const formatDateToICS = (dateStr) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const start = formatDateToICS(event.startsAt);
  const end = formatDateToICS(event.endsAt);
  const now = formatDateToICS(new Date());

  const cleanTitle = (event.title || 'DSU Campus Event').replace(/^DEMO:\s*/, '').replace(/\r?\n/g, ' ');
  const cleanDesc = (event.description || '').replace(/\r?\n/g, '\\n');
  const cleanLoc = (event.venue || 'Dayananda Sagar University').replace(/\r?\n/g, ', ');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dayananda Sagar University//Campus Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:dsu-event-${event._id || Date.now()}@dsu.edu.in`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLoc}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${cleanTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30) || 'event'}.ics`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates Google Calendar web add URL
 */
export function getGoogleCalendarUrl(event) {
  if (!event) return '#';
  const formatGDate = (d) => new Date(d).toISOString().replace(/-|:|\.\d\d\d/g, '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title.replace(/^DEMO:\s*/, '')
  )}&dates=${formatGDate(event.startsAt)}/${formatGDate(event.endsAt)}&details=${encodeURIComponent(
    event.description || ''
  )}&location=${encodeURIComponent(event.venue || 'Dayananda Sagar University')}`;
}
