import mongoose from 'mongoose';
import { Event } from '../../models/Event.js';
import { Registration } from '../../models/Registration.js';
import { ApiError } from '../../utils/ApiError.js';
import { eventsCache } from '../../utils/cache.js';
import {
  sendEventCancellationEmail,
  sendEventUpdateEmail
} from '../../services/email/email.service.js';

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function getPublicEvents(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 9));
  const skip = (page - 1) * limit;

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.internal('Database connection unavailable. Please check database status.');
  }

  // Fast-Path: In-Memory Micro-Cache for High-Throughput Concurrency (1000+ simultaneous requests)
  const cacheKey = `pub_events_${JSON.stringify(query)}`;
  const cached = eventsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const filter = { status: 'published' };
  const sortOptions = {
    soonest: { startsAt: 1 },
    latest: { startsAt: -1 },
    popular: { registeredCount: -1, startsAt: 1 }
  };
  const sort = sortOptions[query.sort] || sortOptions.soonest;

  if (query.search) {
    const escaped = escapeRegex(query.search);
    const searchRegex = { $regex: escaped, $options: 'i' };
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { venue: searchRegex },
      { organizerClub: searchRegex }
    ];
  }

  if (query.school) {
    const schoolRegex = { $regex: escapeRegex(query.school), $options: 'i' };
    const schoolCondition = [{ organizerClub: schoolRegex }, { description: schoolRegex }];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: schoolCondition }];
      delete filter.$or;
    } else {
      filter.$or = schoolCondition;
    }
  }

  if (query.venue) {
    filter.venue = { $regex: escapeRegex(query.venue), $options: 'i' };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.from) {
    filter.endsAt = { $gte: new Date(query.from) };
  } else {
    // Default: events that haven't finished yet
    filter.endsAt = { $gte: new Date() };
  }

  if (query.to) {
    filter.startsAt = { ...(filter.startsAt || {}), $lte: new Date(query.to) };
  }

  const now = new Date();
  const queryChain = Event.find(filter).sort(sort).skip(skip).limit(limit);
  const [rawItems, total] = await Promise.all([
    typeof queryChain.lean === 'function' ? queryChain.lean() : queryChain,
    Event.countDocuments(filter)
  ]);

  const items = (rawItems || []).map((item) => ({
    ...item,
    id: item._id ? item._id.toString() : item.id,
    phase: now < item.startsAt ? 'upcoming' : now > item.endsAt ? 'completed' : 'ongoing'
  }));

  const result = {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1
  };

  eventsCache.set(cacheKey, result, 5);
  return result;
}

export async function getEventById(id, currentUser) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.internal('Database connection unavailable. Please check database status.');
  }

  const event = await Event.findById(id).populate('createdBy', 'name email clubName');
  if (!event) throw ApiError.notFound('Event not found');

  // Rule R1: Non-admins/non-organizers only see published events
  const isPrivileged = currentUser && (currentUser.role === 'admin' || (currentUser.role === 'organizer' && event.createdBy._id.equals(currentUser._id)));
  if (event.status !== 'published' && !isPrivileged) {
    throw ApiError.notFound('Event not found');
  }

  let myRegistration = null;
  if (currentUser) {
    const reg = await Registration.findOne({ event: id, student: currentUser._id });
    if (reg) {
      myRegistration = {
        _id: reg._id,
        status: reg.status,
        attended: reg.attended,
        ticketCode: reg.ticketCode
      };
    }
  }

  return {
    ...event.toJSON(),
    myRegistration
  };
}

export async function getAdminEvents(query, user) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.internal('Database connection unavailable. Please check database status.');
  }

  const filter = {};
  if (user.role === 'organizer') {
    filter.createdBy = user._id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const escaped = escapeRegex(query.search);
    const searchRegex = { $regex: escaped, $options: 'i' };
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { venue: searchRegex },
      { organizerClub: searchRegex }
    ];
  }

  if (query.school) {
    const schoolRegex = { $regex: escapeRegex(query.school), $options: 'i' };
    const schoolCondition = [{ organizerClub: schoolRegex }, { description: schoolRegex }];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: schoolCondition }];
      delete filter.$or;
    } else {
      filter.$or = schoolCondition;
    }
  }

  if (query.venue) {
    filter.venue = { $regex: escapeRegex(query.venue), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name clubName email'),
    Event.countDocuments(filter)
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export async function createEvent(data, user) {
  if (new Date(data.startsAt) <= new Date()) {
    throw ApiError.badRequest('Event startsAt must be in the future');
  }

  const event = await Event.create({
    ...data,
    status: 'draft',
    createdBy: user._id,
    organizerClub: user.clubName || data.organizerClub || 'DSU Events Club'
  });

  eventsCache.clear();
  return event;
}

export async function updateEvent(id, data, user) {
  const event = await Event.findById(id);
  if (!event) throw ApiError.notFound('Event not found');

  if (user.role !== 'admin' && !event.createdBy.equals(user._id)) {
    throw ApiError.forbidden('You can only update events created by your club');
  }

  // Rule R6: Capacity cannot be updated below current registeredCount
  if (data.capacity !== undefined && data.capacity < event.registeredCount) {
    throw ApiError.badRequest(`Capacity cannot be lower than current registrations (${event.registeredCount})`);
  }

  const startsAt = data.startsAt ?? event.startsAt;
  const endsAt = data.endsAt ?? event.endsAt;
  if (new Date(endsAt) <= new Date(startsAt)) {
    throw ApiError.badRequest('End date/time must be after start date/time');
  }

  const wasCancelled = event.status !== 'cancelled' && data.status === 'cancelled';
  const venueChanged = data.venue && data.venue !== event.venue;
  const timeChanged = data.startsAt && new Date(data.startsAt).getTime() !== new Date(event.startsAt).getTime();

  let resultEvent = event;
  if (data.capacity !== undefined) {
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, $expr: { $lte: ['$registeredCount', data.capacity] } },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!updatedEvent) {
      const currentEvent = await Event.findById(id);
      if (!currentEvent) throw ApiError.notFound('Event not found');
      if (data.capacity < currentEvent.registeredCount) {
        throw ApiError.badRequest(`Capacity cannot be lower than current registrations (${currentEvent.registeredCount})`);
      }
      throw ApiError.conflict('Event changed while it was being updated. Reload and try again.');
    }
    resultEvent = updatedEvent;
  } else {
    Object.assign(event, data);
    await event.save();
    resultEvent = event;
  }

  // Asynchronously notify registered students if cancelled or rescheduled
  if (wasCancelled || (resultEvent.status === 'published' && (venueChanged || timeChanged))) {
    Registration.find({ event: id, status: 'registered' })
      .populate('student', 'name email')
      .then((regs) => {
        for (const r of regs) {
          if (r.student?.email) {
            if (wasCancelled) {
              sendEventCancellationEmail({
                to: r.student.email,
                studentName: r.student.name,
                event: resultEvent
              }).catch(() => {});
            } else if (venueChanged || timeChanged) {
              const summary = venueChanged && timeChanged
                ? `Venue changed to ${resultEvent.venue} and start time rescheduled to ${new Date(resultEvent.startsAt).toLocaleTimeString('en-IN')}`
                : venueChanged
                ? `Venue moved to ${resultEvent.venue}`
                : `Start time rescheduled to ${new Date(resultEvent.startsAt).toLocaleTimeString('en-IN')}`;
              sendEventUpdateEmail({
                to: r.student.email,
                studentName: r.student.name,
                event: resultEvent,
                changeSummary: summary
              }).catch(() => {});
            }
          }
        }
      })
      .catch(() => {});
  }

  eventsCache.clear();
  return resultEvent;
}

export async function deleteEvent(id, user) {
  const event = await Event.findById(id);
  if (!event) throw ApiError.notFound('Event not found');

  if (user.role !== 'admin' && !event.createdBy.equals(user._id)) {
    throw ApiError.forbidden('You can only delete events created by your club');
  }

  // Rule R7: Cannot delete if registrations exist of any status
  const regCount = await Registration.countDocuments({ event: id });
  if (regCount > 0) {
    throw ApiError.conflict(
      `Cannot delete event with existing registrations (${regCount}). Change status to cancelled instead.`
    );
  }

  const deletedEvent = await Event.findOneAndDelete({ _id: id, registeredCount: 0 });
  if (!deletedEvent) {
    throw ApiError.conflict('Event changed while deletion was in progress. Reload and try again.');
  }
  eventsCache.clear();
  return { message: 'Event deleted successfully' };
}
