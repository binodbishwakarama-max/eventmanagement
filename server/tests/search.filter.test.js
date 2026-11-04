import { describe, expect, it, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../src/models/Event.js', () => ({
  Event: {
    find: vi.fn(),
    countDocuments: vi.fn()
  }
}));

import { Event } from '../src/models/Event.js';
import { getPublicEvents } from '../src/modules/events/events.service.js';

describe('Public Events Advanced Search and Filtering Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ title: 'Invento 2026', venue: 'Sir M. Visvesvaraya Auditorium' }])
    };
    Event.find.mockReturnValue(mockQuery);
    Event.countDocuments.mockResolvedValue(1);
  });

  it('performs multi-field search across title, description, venue, and organizer club', async () => {
    await getPublicEvents({ search: 'Auditorium' });

    expect(Event.find).toHaveBeenCalled();
    const calledFilter = Event.find.mock.calls[0][0];
    expect(calledFilter.status).toBe('published');
    expect(calledFilter.$or).toBeDefined();
    expect(calledFilter.$or).toHaveLength(4);
    expect(calledFilter.$or[0].title.$regex).toBe('Auditorium');
    expect(calledFilter.$or[2].venue.$regex).toBe('Auditorium');
  });

  it('filters by academic school or faculty', async () => {
    await getPublicEvents({ school: 'School of Engineering' });

    expect(Event.find).toHaveBeenCalled();
    const calledFilter = Event.find.mock.calls[0][0];
    expect(calledFilter.status).toBe('published');
    expect(calledFilter.$or).toBeDefined();
    expect(calledFilter.$or[0].organizerClub.$regex).toBe('School\\ of\\ Engineering');
  });

  it('filters by campus venue', async () => {
    await getPublicEvents({ venue: 'Harohalli Central Turf' });

    expect(Event.find).toHaveBeenCalled();
    const calledFilter = Event.find.mock.calls[0][0];
    expect(calledFilter.venue.$regex).toBe('Harohalli\\ Central\\ Turf');
  });
});
