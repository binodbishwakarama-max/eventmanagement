import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Event } from '../src/models/Event.js';
import { Registration } from '../src/models/Registration.js';
import { User } from '../src/models/User.js';
import { loginUser, registerUser } from '../src/modules/auth/auth.service.js';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getPublicEvents,
  updateEvent
} from '../src/modules/events/events.service.js';
import {
  cancelRegistration,
  registerForEvent,
  verifyAndCheckInPass
} from '../src/modules/registrations/registrations.service.js';

let mongod;
let adminUser;
let organizerA;
let organizerB;
let studentA;
let studentB;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  adminUser = await User.create({
    name: 'Administrator Desk',
    email: 'admin_test@dsu.edu.in',
    passwordHash: await bcrypt.hash('Admin@123', 10),
    role: 'admin',
    department: 'Registrar Office'
  });

  organizerA = await User.create({
    name: 'Organizer Alpha',
    email: 'org_a@dsu.edu.in',
    passwordHash: await bcrypt.hash('Org@123', 10),
    role: 'organizer',
    department: 'CSE',
    clubName: 'Club Alpha'
  });

  organizerB = await User.create({
    name: 'Organizer Beta',
    email: 'org_b@dsu.edu.in',
    passwordHash: await bcrypt.hash('Org@123', 10),
    role: 'organizer',
    department: 'ECE',
    clubName: 'Club Beta'
  });

  studentA = await User.create({
    name: 'Student One',
    email: 'student_1@dsu.edu.in',
    passwordHash: await bcrypt.hash('Student@123', 10),
    role: 'student',
    usn: '1DS22CS001',
    rollNumber: '1DS22CS001',
    department: 'CSE'
  });

  studentB = await User.create({
    name: 'Student Two',
    email: 'student_2@dsu.edu.in',
    passwordHash: await bcrypt.hash('Student@123', 10),
    role: 'student',
    usn: '1DS22CS002',
    rollNumber: '1DS22CS002',
    department: 'ECE'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Phase 2: Authentication & Authorization (RBAC)', () => {
  it('registers a new student with forced student role and hashed password', async () => {
    const res = await registerUser({
      name: 'New Scholar',
      email: 'new_scholar@dsu.edu.in',
      password: 'SecurePassword@123',
      usn: '1DS22CS099',
      department: 'School of Engineering'
    });

    expect(res.user.role).toBe('student');
    expect(res.user.passwordHash).toBeUndefined();
    expect(res.token).toBeDefined();

    const dbUser = await User.findById(res.user._id);
    expect(dbUser.role).toBe('student');
    const validPw = await bcrypt.compare('SecurePassword@123', dbUser.passwordHash);
    expect(validPw).toBe(true);
  });

  it('rejects duplicate email registrations with HTTP 409 conflict', async () => {
    await expect(
      registerUser({
        name: 'Duplicate Scholar',
        email: 'student_1@dsu.edu.in',
        password: 'Password@123'
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('authenticates valid credentials and returns a valid JWT', async () => {
    const res = await loginUser({ email: 'student_1@dsu.edu.in', password: 'Student@123' });
    expect(res.user.email).toBe('student_1@dsu.edu.in');
    expect(res.token).toBeDefined();
  });

  it('rejects invalid password with HTTP 401 unauthorized', async () => {
    await expect(
      loginUser({ email: 'student_1@dsu.edu.in', password: 'WrongPassword' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects nonexistent email with HTTP 401 unauthorized (timing-attack resistant)', async () => {
    await expect(
      loginUser({ email: 'nonexistent@dsu.edu.in', password: 'Password@123' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('Phase 4: Event Management & Organizer Scoping', () => {
  let createdEvent;

  it('creates an event in draft status with future dates', async () => {
    createdEvent = await createEvent(
      {
        title: 'Cloud & AI Architecture Summit',
        description: 'Comprehensive keynote exploring resilient cloud systems.',
        category: 'Technical',
        venue: 'Sir M. Visvesvaraya Auditorium',
        startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        capacity: 10,
        organizerClub: 'Club Alpha'
      },
      organizerA
    );

    expect(createdEvent.status).toBe('draft');
    expect(createdEvent.createdBy.toString()).toBe(organizerA._id.toString());
  });

  it('rejects event creation with startsAt in the past', async () => {
    await expect(
      createEvent(
        {
          title: 'Past Event',
          description: 'This event is in the past.',
          category: 'Seminar',
          venue: 'Room 101',
          startsAt: new Date(Date.now() - 60000),
          endsAt: new Date(Date.now() + 60000),
          capacity: 10
        },
        organizerA
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('blocks Organizer B from editing an event owned by Organizer A (HTTP 403)', async () => {
    await expect(
      updateEvent(createdEvent._id, { title: 'Hijacked Title' }, organizerB)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('allows Organizer A to publish their own event', async () => {
    const updated = await updateEvent(createdEvent._id, { status: 'published' }, organizerA);
    expect(updated.status).toBe('published');
  });

  it('allows Admin to update any organizer’s event', async () => {
    const updated = await updateEvent(
      createdEvent._id,
      { venue: 'Harohalli Central Lawn' },
      adminUser
    );
    expect(updated.venue).toBe('Harohalli Central Lawn');
  });
});

describe('Phase 5: Registration Lifecycle, Atomic Quota & Cancellation', () => {
  let cappedEvent;

  beforeAll(async () => {
    cappedEvent = await Event.create({
      title: 'Limited Capacity Masterclass',
      description: 'Exclusive 2-seat masterclass for testing capacity constraints.',
      category: 'Workshop',
      venue: 'Design Studio',
      startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      capacity: 2,
      registeredCount: 0,
      status: 'published',
      createdBy: organizerA._id,
      organizerClub: 'Club Alpha'
    });
  });

  it('allows Student A to register successfully and increments registeredCount', async () => {
    const reg = await registerForEvent(cappedEvent._id, studentA._id);
    expect(reg.status).toBe('registered');
    expect(reg.ticketCode).toMatch(/^EVT-/);

    const refEvent = await Event.findById(cappedEvent._id);
    expect(refEvent.registeredCount).toBe(1);
  });

  it('blocks duplicate registration by Student A with HTTP 409 conflict', async () => {
    await expect(
      registerForEvent(cappedEvent._id, studentA._id)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('allows Student B to take the final available seat', async () => {
    const reg = await registerForEvent(cappedEvent._id, studentB._id);
    expect(reg.status).toBe('registered');

    const refEvent = await Event.findById(cappedEvent._id);
    expect(refEvent.registeredCount).toBe(2);
  });

  it('rejects a 3rd registration when event is at full capacity (HTTP 409)', async () => {
    const extraStudent = await User.create({
      name: 'Student Three',
      email: 'student_3@dsu.edu.in',
      passwordHash: 'dummy',
      role: 'student'
    });

    await expect(
      registerForEvent(cappedEvent._id, extraStudent._id)
    ).rejects.toMatchObject({ statusCode: 409, message: 'Event is full' });

    const refEvent = await Event.findById(cappedEvent._id);
    expect(refEvent.registeredCount).toBe(2); // strictly no overbooking
  });

  it('enforces Rule R6: prevents organizer from lowering capacity below registeredCount', async () => {
    await expect(
      updateEvent(cappedEvent._id, { capacity: 1 }, organizerA)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('enforces Rule R7: prevents organizer from deleting event with active registrations', async () => {
    await expect(
      deleteEvent(cappedEvent._id, organizerA)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('allows student to cancel registration and decrements registeredCount', async () => {
    const cancelRes = await cancelRegistration(cappedEvent._id, studentA._id);
    expect(cancelRes.message).toMatch(/cancelled successfully/);

    const refEvent = await Event.findById(cappedEvent._id);
    expect(refEvent.registeredCount).toBe(1);
  });

  it('reactivates cancelled registration when student registers again', async () => {
    const reg = await registerForEvent(cappedEvent._id, studentA._id);
    expect(reg.status).toBe('registered');

    const refEvent = await Event.findById(cappedEvent._id);
    expect(refEvent.registeredCount).toBe(2);
  });
});

describe('Phase 6: Dedicated QR Pass Verification & Check-in Desk', () => {
  let liveEvent;
  let attendeeReg;

  beforeAll(async () => {
    liveEvent = await Event.create({
      title: 'Varsity Keynote Day',
      description: 'Check-in pass verification test.',
      category: 'Seminar',
      venue: 'Main Auditorium',
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 10,
      registeredCount: 0,
      status: 'published',
      createdBy: organizerA._id,
      organizerClub: 'Club Alpha'
    });

    attendeeReg = await registerForEvent(liveEvent._id, studentA._id);
  });

  it('blocks unauthorized organizer from checking in students for another club event', async () => {
    await expect(
      verifyAndCheckInPass(liveEvent._id, attendeeReg.ticketCode, organizerB)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('rejects nonexistent or forged ticket codes with HTTP 404', async () => {
    await expect(
      verifyAndCheckInPass(liveEvent._id, 'EVT-FAKE12345678', organizerA)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('successfully verifies and checks in student pass with valid ticketCode', async () => {
    const checkIn = await verifyAndCheckInPass(liveEvent._id, attendeeReg.ticketCode, organizerA);
    expect(checkIn.attended).toBe(true);
    expect(checkIn.student.name).toBe(studentA.name);
    expect(checkIn.student.usn).toBe('1DS22CS001');
    expect(checkIn.attendedAt).toBeDefined();

    const dbReg = await Registration.findById(attendeeReg._id);
    expect(dbReg.attended).toBe(true);
  });

  it('prevents duplicate scans and rejects already checked-in passes (HTTP 409)', async () => {
    await expect(
      verifyAndCheckInPass(liveEvent._id, attendeeReg.ticketCode, organizerA)
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

