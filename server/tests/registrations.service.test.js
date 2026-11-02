import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/models/Event.js', () => ({
  Event: {
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}));

vi.mock('../src/models/Registration.js', () => ({
  Registration: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
    find: vi.fn()
  }
}));

import { Event } from '../src/models/Event.js';
import { Registration } from '../src/models/Registration.js';
import {
  cancelRegistration,
  getEventRegistrations,
  registerForEvent,
  updateAttendance
} from '../src/modules/registrations/registrations.service.js';

const futureEvent = {
  _id: 'event-1',
  status: 'published',
  startsAt: new Date(Date.now() + 60_000),
  createdBy: { equals: (id) => id === 'organizer-1' }
};

const admin = { _id: 'admin-1', role: 'admin' };

describe('registration business rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Event.findById.mockResolvedValue(futureEvent);
    Event.findOneAndUpdate.mockResolvedValue(futureEvent);
    Event.findByIdAndUpdate.mockResolvedValue(futureEvent);
    Registration.findOne.mockResolvedValue(null);
    Registration.findOneAndUpdate.mockResolvedValue({ _id: 'registration-1' });
    Registration.create.mockResolvedValue({ _id: 'registration-1', status: 'registered' });
  });

  it('reserves the final seat only once under concurrent registrations', async () => {
    let reservedSeats = 0;
    Event.findOneAndUpdate.mockImplementation(async () => {
      if (reservedSeats === 1) return null;
      reservedSeats += 1;
      return futureEvent;
    });
    Event.findById.mockImplementation(async () => ({
      ...futureEvent,
      registeredCount: reservedSeats
    }));

    const results = await Promise.allSettled([
      registerForEvent('event-1', 'student-1'),
      registerForEvent('event-1', 'student-2')
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(reservedSeats).toBe(1);
    expect(Event.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ $expr: { $lt: ['$registeredCount', '$capacity'] } }),
      { $inc: { registeredCount: 1 } },
      { new: true }
    );
  });

  it('reactivates a cancelled registration with a conditional state transition', async () => {
    Registration.findOne.mockResolvedValue({ _id: 'registration-1', status: 'cancelled' });

    await registerForEvent('event-1', 'student-1');

    expect(Registration.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'registration-1', event: 'event-1', student: 'student-1', status: 'cancelled' },
      {
        $set: expect.objectContaining({
          status: 'registered',
          attended: false,
          attendedAt: null,
          cancelledAt: null
        })
      },
      { new: true }
    );
  });

  it('rejects an active duplicate before attempting a capacity reservation', async () => {
    Registration.findOne.mockResolvedValue({ _id: 'registration-1', status: 'registered' });

    await expect(registerForEvent('event-1', 'student-1')).rejects.toMatchObject({
      statusCode: 409,
      message: 'Already registered'
    });
    expect(Event.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('does not decrement capacity twice when a registration is cancelled twice', async () => {
    Registration.findOneAndUpdate
      .mockResolvedValueOnce({ _id: 'registration-1' })
      .mockResolvedValueOnce(null);

    await cancelRegistration('event-1', 'student-1');
    await expect(cancelRegistration('event-1', 'student-1')).rejects.toMatchObject({
      statusCode: 404
    });

    expect(Event.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(Event.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ registeredCount: { $gt: 0 } }),
      { $inc: { registeredCount: -1 } },
      { new: true }
    );
  });

  it('rejects duplicate check-ins and scopes organizer roster access to owned events', async () => {
    const startedEvent = { ...futureEvent, startsAt: new Date(Date.now() - 60_000) };
    Event.findById.mockResolvedValue(startedEvent);
    Registration.findOneAndUpdate.mockResolvedValueOnce(null);
    Registration.findOne.mockResolvedValueOnce({
      _id: 'registration-1',
      status: 'registered',
      attended: true
    });

    await expect(updateAttendance('event-1', 'registration-1', true, admin)).rejects.toMatchObject({
      statusCode: 409,
      message: 'Already checked in'
    });

    await expect(
      getEventRegistrations('event-1', { _id: 'organizer-2', role: 'organizer' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('rejects attendance before the event starts', async () => {
    await expect(
      updateAttendance('event-1', 'registration-1', true, admin)
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(Registration.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
