import { describe, it, expect } from 'vitest';
import {
  cleanEventTitle,
  formatEventDateTime,
  getEventRegistrationStatus,
  buildEventQueryParams
} from './eventFilters.js';

describe('Event Domain Pure Functions', () => {
  describe('cleanEventTitle', () => {
    it('strips DEMO prefixes case-insensitively', () => {
      expect(cleanEventTitle('DEMO: AI Colloquium')).toBe('AI Colloquium');
      expect(cleanEventTitle('demo: Hackathon 2026')).toBe('Hackathon 2026');
      expect(cleanEventTitle('Varsity Football League')).toBe('Varsity Football League');
      expect(cleanEventTitle('')).toBe('');
    });
  });

  describe('formatEventDateTime', () => {
    it('formats ISO timestamps into human readable parts', () => {
      const result = formatEventDateTime('2026-11-15T10:30:00.000Z');
      expect(result.month).toBeDefined();
      expect(result.day).toBeDefined();
      expect(result.fullFormatted).toContain('2026');
    });

    it('handles invalid or empty inputs gracefully', () => {
      const result = formatEventDateTime(null);
      expect(result.fullFormatted).toBe('');
    });
  });

  describe('getEventRegistrationStatus', () => {
    const fixedNow = new Date('2026-11-10T12:00:00.000Z');

    it('returns danger when event is cancelled', () => {
      const status = getEventRegistrationStatus({ status: 'cancelled' }, fixedNow);
      expect(status.isOpen).toBe(false);
      expect(status.label).toBe('Cancelled');
      expect(status.variant).toBe('danger');
    });

    it('returns sold out when capacity is reached', () => {
      const status = getEventRegistrationStatus(
        {
          status: 'published',
          startsAt: '2026-11-15T10:00:00.000Z',
          capacity: 50,
          registeredCount: 50
        },
        fixedNow
      );
      expect(status.isOpen).toBe(false);
      expect(status.label).toBe('Sold Out');
      expect(status.variant).toBe('danger');
    });

    it('reports low seats remaining with warning variant', () => {
      const status = getEventRegistrationStatus(
        {
          status: 'published',
          startsAt: '2026-11-15T10:00:00.000Z',
          capacity: 50,
          registeredCount: 46
        },
        fixedNow
      );
      expect(status.isOpen).toBe(true);
      expect(status.label).toBe('Only 4 left!');
      expect(status.variant).toBe('warning');
    });

    it('reports open seats when capacity is plentiful', () => {
      const status = getEventRegistrationStatus(
        {
          status: 'published',
          startsAt: '2026-11-15T10:00:00.000Z',
          capacity: 100,
          registeredCount: 20
        },
        fixedNow
      );
      expect(status.isOpen).toBe(true);
      expect(status.label).toBe('80 seats open');
      expect(status.variant).toBe('success');
    });
  });

  describe('buildEventQueryParams', () => {
    it('serializes search parameters with proper defaults', () => {
      const params = buildEventQueryParams({
        page: 2,
        search: 'robotics',
        category: 'Technical',
        school: 'School of Engineering'
      });
      expect(params.page).toBe(2);
      expect(params.search).toBe('robotics');
      expect(params.category).toBe('Technical');
      expect(params.school).toBe('School of Engineering');
    });

    it('omits All category or empty values', () => {
      const params = buildEventQueryParams({
        category: 'All',
        search: '   ',
        school: ''
      });
      expect(params.category).toBeUndefined();
      expect(params.search).toBeUndefined();
      expect(params.school).toBeUndefined();
    });
  });
});

