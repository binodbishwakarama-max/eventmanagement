import mongoose from 'mongoose';
import { Event } from '../../models/Event.js';
import { Registration } from '../../models/Registration.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/respond.js';

export const getStats = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.internal('Database connection unavailable. Please check database status.');
  }

  const filter = {};
  if (req.user.role === 'organizer') {
    filter.createdBy = req.user._id;
  }

  const now = new Date();
  const totalEvents = await Event.countDocuments(filter);
  const publishedEvents = await Event.countDocuments({ ...filter, status: 'published' });
  const upcomingEvents = await Event.countDocuments({ ...filter, status: 'published', startsAt: { $gt: now } });

  // Get matching event IDs
  const userEvents = await Event.find(filter).select('_id');
  const userEventIds = userEvents.map((e) => e._id);

  const totalRegistrations = await Registration.countDocuments({
    event: { $in: userEventIds },
    status: 'registered'
  });

  const attendedRegistrations = await Registration.countDocuments({
    event: { $in: userEventIds },
    status: 'registered',
    attended: true
  });

  const attendanceRate = totalRegistrations > 0
    ? Math.round((attendedRegistrations / totalRegistrations) * 100)
    : 0;

  const upcoming = await Event.find({ ...filter, status: 'published', startsAt: { $gt: now } })
    .sort({ startsAt: 1 })
    .limit(5)
    .select('title category startsAt capacity registeredCount organizerClub');

  return ok(res, {
    totalEvents,
    publishedEvents,
    upcomingEvents,
    totalRegistrations,
    attendanceRate,
    upcoming
  });
});

