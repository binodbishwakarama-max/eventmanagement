import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/models/Event.js', () => ({
  Event: {
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn()
  }
}));

vi.mock('../src/models/Registration.js', () => ({
  Registration: {
    countDocuments: vi.fn()
  }
}));

import { Event } from '../src/models/Event.js';
import { Registration } from '../src/models/Registration.js';
import { deleteEvent, updateEvent } from '../src/modules/events/events.service.js';

const ownedEvent = () => ({
  _id: 'event-1',
  registeredCount: 2,
  startsAt: new Date(Date.now() + 60_000),
  endsAt: new Date(Date.now() + 120_000),
  createdBy: { equals: (id) => id === 'organizer-1' },
  save: vi.fn().mockResolvedValue({ _id: 'event-1' })
});

describe('event management rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Event.findById.mockResolvedValue(ownedEvent());
    Event.findOneAndUpdate.mockResolvedValue(ownedEvent());
    Event.findOneAndDelete.mockResolvedValue({});
    Registration.countDocuments.mockResolvedValue(0);
  });

  it('prevents an organizer from changing another organizer’s event', async () => {
    await expect(
      updateEvent('event-1', { title: 'Updated event' }, { _id: 'organizer-2', role: 'organizer' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('prevents capacity from dropping below active registrations', async () => {
    await expect(
      updateEvent('event-1', { capacity: 1 }, { _id: 'organizer-1', role: 'organizer' })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Capacity cannot be lower than current registrations (2)'
    });
  });

  it('rechecks the capacity floor atomically against the latest registration count', async () => {
    Event.findById
      .mockResolvedValueOnce({ ...ownedEvent(), registeredCount: 1 })
      .mockResolvedValueOnce({ ...ownedEvent(), registeredCount: 2 });
    Event.findOneAndUpdate.mockResolvedValue(null);

    await expect(
      updateEvent('event-1', { capacity: 1 }, { _id: 'organizer-1', role: 'organizer' })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Capacity cannot be lower than current registrations (2)'
    });
    expect(Event.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'event-1', $expr: { $lte: ['$registeredCount', 1] } },
      { $set: { capacity: 1 } },
      { new: true, runValidators: true }
    );
  });

  it('blocks deletion when registration history exists', async () => {
    Registration.countDocuments.mockResolvedValue(1);

    await expect(
      deleteEvent('event-1', { _id: 'organizer-1', role: 'organizer' })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(Event.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('uses a conditional delete to prevent a simultaneous registration race', async () => {
    Event.findOneAndDelete.mockResolvedValue(null);

    await expect(
      deleteEvent('event-1', { _id: 'organizer-1', role: 'organizer' })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(Event.findOneAndDelete).toHaveBeenCalledWith({ _id: 'event-1', registeredCount: 0 });
  });
});
