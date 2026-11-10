import { Event } from '../../models/Event.js';
import { Registration } from '../../models/Registration.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { eventsCache } from '../../utils/cache.js';
import { sendRegistrationConfirmationEmail } from '../../services/email/email.service.js';

export async function registerForEvent(eventId, studentId) {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  if (event.status !== 'published') {
    throw ApiError.badRequest('Registration closed: event is not published');
  }

  const now = new Date();
  if (now >= event.startsAt) {
    throw ApiError.badRequest('Registration closed');
  }

  const existingReg = await Registration.findOne({ event: eventId, student: studentId });
  if (existingReg && existingReg.status === 'registered') {
    throw ApiError.conflict('Already registered');
  }

  // Reserve capacity before creating or reactivating the unique registration record.
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      status: 'published',
      startsAt: { $gt: now },
      $expr: { $lt: ['$registeredCount', '$capacity'] }
    },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );

  if (!updatedEvent) {
    const currentEvent = await Event.findById(eventId);
    if (!currentEvent) throw ApiError.notFound('Event not found');
    if (currentEvent.status !== 'published' || new Date() >= currentEvent.startsAt) {
      throw ApiError.badRequest('Registration closed');
    }
    throw ApiError.conflict('Event is full');
  }

  try {
    let registration;
    if (existingReg) {
      registration = await Registration.findOneAndUpdate(
        { _id: existingReg._id, event: eventId, student: studentId, status: 'cancelled' },
        {
          $set: {
            status: 'registered',
            attended: false,
            attendedAt: null,
            cancelledAt: null,
            registeredAt: new Date()
          }
        },
        { new: true }
      );
      if (!registration) throw ApiError.conflict('Already registered');
    } else {
      registration = await Registration.create({
        event: eventId,
        student: studentId,
        status: 'registered'
      });
    }

    // Asynchronously dispatch pass confirmation email to student
    User.findById(studentId).select('name email').then((student) => {
      if (student?.email) {
        sendRegistrationConfirmationEmail({
          to: student.email,
          studentName: student.name,
          event,
          ticketCode: registration.ticketCode
        }).catch((err) => console.error('[Email Error] Confirmation email failed:', err.message));
      }
    }).catch(() => {});

    eventsCache.clear();
    return registration;
  } catch (err) {
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
    if (err?.code === 11000) throw ApiError.conflict('Already registered');
    throw err;
  }
}

export async function cancelRegistration(eventId, studentId) {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  const now = new Date();
  if (now >= event.startsAt) {
    throw ApiError.badRequest('Cannot cancel registration after event has started');
  }

  const reg = await Registration.findOneAndUpdate(
    { event: eventId, student: studentId, status: 'registered' },
    { $set: { status: 'cancelled', cancelledAt: now } },
    { new: true }
  );
  if (!reg) {
    throw ApiError.notFound('Active registration not found');
  }

  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId, startsAt: { $gt: now }, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } },
    { new: true }
  );
  if (!updatedEvent) {
    await Registration.findOneAndUpdate(
      { _id: reg._id, status: 'cancelled', cancelledAt: now },
      { $set: { status: 'registered', cancelledAt: null } },
      { new: true }
    );
    const currentEvent = await Event.findById(eventId);
    if (!currentEvent) throw ApiError.notFound('Event not found');
    if (now >= currentEvent.startsAt) {
      throw ApiError.badRequest('Cannot cancel registration after event has started');
    }
    throw ApiError.internal('Event registration count could not be updated');
  }

  eventsCache.clear();
  return { message: 'Registration cancelled successfully' };
}

export async function getStudentRegistrations(studentId) {
  const registrations = await Registration.find({ student: studentId })
    .populate('event')
    .sort({ createdAt: -1 });

  return registrations;
}

export async function getEventRegistrations(eventId, user) {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  if (user.role !== 'admin' && !event.createdBy.equals(user._id)) {
    throw ApiError.forbidden('You do not have permission to view registrations for this event');
  }

  const registrations = await Registration.find({ event: eventId, status: 'registered' })
    .populate('student', 'name email rollNumber usn department')
    .sort({ registeredAt: 1 });

  return registrations;
}

export async function updateAttendance(eventId, registrationId, attended, user) {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  if (user.role !== 'admin' && !event.createdBy.equals(user._id)) {
    throw ApiError.forbidden('You do not have permission to mark attendance for this event');
  }

  // Rule R5: Attendance is set only when now >= startsAt
  const now = new Date();
  if (now < event.startsAt) {
    throw ApiError.badRequest('Attendance can only be marked after the event has started');
  }

  const reg = await Registration.findOneAndUpdate(
    {
      _id: registrationId,
      event: eventId,
      status: 'registered',
      ...(attended ? { attended: false } : {})
    },
    { $set: { attended, attendedAt: attended ? now : null } },
    { new: true }
  );
  if (!reg) {
    const currentRegistration = await Registration.findOne({ _id: registrationId, event: eventId });
    if (!currentRegistration || currentRegistration.status !== 'registered') {
      throw ApiError.notFound('Active registration not found');
    }
    if (attended && currentRegistration.attended) {
      throw ApiError.conflict('Already checked in');
    }
    throw ApiError.conflict('Attendance status changed; refresh and try again');
  }

  return reg;
}

export async function verifyAndCheckInPass(eventId, ticketCode, user) {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  if (user.role !== 'admin' && !event.createdBy.equals(user._id)) {
    throw ApiError.forbidden('You do not have permission to verify passes for this event');
  }

  const normalizedCode = ticketCode.toUpperCase().trim();
  const registration = await Registration.findOne({
    event: eventId,
    ticketCode: normalizedCode
  }).populate('student', 'name email rollNumber usn department');

  if (!registration) {
    throw ApiError.notFound('No valid ticket found with this verification code for this event');
  }

  if (registration.status !== 'registered') {
    throw ApiError.badRequest('This registration has been cancelled');
  }

  if (registration.attended) {
    const timeStr = registration.attendedAt ? new Date(registration.attendedAt).toLocaleTimeString('en-IN') : 'earlier';
    throw ApiError.conflict(`Duplicate scan: pass already checked in at ${timeStr}`);
  }

  // Atomically mark attendance
  const now = new Date();
  const updatedReg = await Registration.findOneAndUpdate(
    { _id: registration._id, attended: false, status: 'registered' },
    { $set: { attended: true, attendedAt: now } },
    { new: true }
  );

  if (!updatedReg) {
    const current = await Registration.findById(registration._id);
    const timeStr = current?.attendedAt ? new Date(current.attendedAt).toLocaleTimeString('en-IN') : 'earlier';
    throw ApiError.conflict(`Duplicate scan: pass already checked in at ${timeStr}`);
  }

  return {
    registrationId: registration._id,
    ticketCode: registration.ticketCode,
    student: {
      name: registration.student?.name,
      email: registration.student?.email,
      usn: registration.student?.usn || registration.student?.rollNumber,
      department: registration.student?.department
    },
    eventTitle: event.title,
    attended: true,
    attendedAt: now
  };
}
