import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';

const day = 24 * 60 * 60 * 1000;

const demoEvents = (now, organizerId, adminId) => [
  {
    title: 'DEMO: Maker Sprint — Build for a Better Campus',
    description: 'Fictional local-only event data for testing registration, capacity limits and organizer workflows.',
    category: 'Technical',
    startsAt: new Date(now + 3 * day),
    endsAt: new Date(now + 3 * day + 12 * 60 * 60 * 1000),
    capacity: 30,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: Shape, Type & Interface Workshop',
    description: 'Fictional workshop entry. Confirm the venue, eligibility and all event details before any real use.',
    category: 'Workshop',
    startsAt: new Date(now + 7 * day),
    endsAt: new Date(now + 7 * day + 4 * 60 * 60 * 1000),
    capacity: 24,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: Open Stage Sessions',
    description: 'Sample cultural gathering for local walkthroughs. This is not a real or scheduled university event.',
    category: 'Cultural',
    startsAt: new Date(now + 14 * day),
    endsAt: new Date(now + 14 * day + 5 * 60 * 60 * 1000),
    capacity: 60,
    status: 'published',
    createdBy: adminId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: Friendly Football Round',
    description: 'Fictional past event used to preview attendance and student history screens.',
    category: 'Sports',
    startsAt: new Date(now - 5 * day),
    endsAt: new Date(now - 5 * day + 3 * 60 * 60 * 1000),
    capacity: 20,
    status: 'published',
    createdBy: adminId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: Notes on Emerging Ideas',
    description: 'Fictional seminar entry for testing past-event registration status and analytics.',
    category: 'Seminar',
    startsAt: new Date(now - 12 * day),
    endsAt: new Date(now - 12 * day + 2 * 60 * 60 * 1000),
    capacity: 40,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: Prototype Review Hours',
    description: 'Draft-only sample. It is not visible to student accounts or the public.',
    category: 'Technical',
    startsAt: new Date(now + 20 * day),
    endsAt: new Date(now + 20 * day + 4 * 60 * 60 * 1000),
    capacity: 35,
    status: 'draft',
    createdBy: organizerId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: A Day for Small Ideas',
    description: 'Cancelled sample event for exercising cancellation banners and organizer controls.',
    category: 'Other',
    startsAt: new Date(now + 22 * day),
    endsAt: new Date(now + 22 * day + 4 * 60 * 60 * 1000),
    capacity: 30,
    status: 'cancelled',
    createdBy: organizerId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: The Open Studio',
    description: 'Fictional event currently in progress in the demo data. Do not treat this location as real.',
    category: 'Cultural',
    startsAt: new Date(now - 60 * 60 * 1000),
    endsAt: new Date(now + 2 * 60 * 60 * 1000),
    capacity: 16,
    status: 'published',
    createdBy: adminId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: A First Look at Product Thinking',
    description: 'Sample listing for checking date filters, event details and sign-up states.',
    category: 'Seminar',
    startsAt: new Date(now + 9 * day),
    endsAt: new Date(now + 9 * day + 90 * 60 * 1000),
    capacity: 45,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'Demo events team'
  },
  {
    title: 'DEMO: The Last Place Showcase',
    description: 'A capacity-one sample for demonstrating the full-event registration state.',
    category: 'Other',
    startsAt: new Date(now + 4 * day),
    endsAt: new Date(now + 4 * day + 2 * 60 * 60 * 1000),
    capacity: 1,
    status: 'published',
    createdBy: adminId,
    organizerClub: 'Demo events team'
  }
];

async function createDemoRegistration(event, student, attended = false) {
  const existing = await Registration.findOne({ event: event._id, student: student._id });
  if (existing) return;

  await Registration.create({
    event: event._id,
    student: student._id,
    status: 'registered',
    attended,
    attendedAt: attended ? new Date() : null
  });
  await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
}

export async function seed() {
  const reset = process.argv.includes('--reset');
  const localMongo = /^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(env.MONGODB_URI);
  if (!localMongo) {
    throw new Error('Fictional demo seeding is restricted to a local MongoDB instance');
  }
  if (reset) {
    if (!localMongo || process.env.NODE_ENV === 'production') {
      throw new Error('--reset is restricted to a local, non-production MongoDB instance');
    }
  }

  await mongoose.connect(env.MONGODB_URI);
  try {
    if (reset) {
      await Promise.all([
        User.deleteMany({}),
        Event.deleteMany({}),
        Registration.deleteMany({})
      ]);
    }

    const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    const admin = await User.findOneAndUpdate(
      { email: env.ADMIN_EMAIL.toLowerCase() },
      {
        $setOnInsert: {
          name: 'Demo administrator',
          email: env.ADMIN_EMAIL.toLowerCase(),
          passwordHash: adminPasswordHash,
          role: 'admin'
        }
      },
      { new: true, upsert: true }
    );
    const organizerPasswordHash = await bcrypt.hash('Organizer@123', 12);
    const organizer = await User.findOneAndUpdate(
      { email: 'organizer@example.test' },
      {
        $setOnInsert: {
          name: 'Demo organizer',
          email: 'organizer@example.test',
          passwordHash: organizerPasswordHash,
          role: 'organizer',
          clubName: 'Demo events team'
        }
      },
      { new: true, upsert: true }
    );

    const studentPasswordHash = await bcrypt.hash('Student@123', 12);
    const students = [];
    for (let number = 1; number <= 6; number += 1) {
      const email = `student${number}@example.test`;
      const student = await User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            name: `Demo student ${number}`,
            email,
            passwordHash: studentPasswordHash,
            role: 'student'
          }
        },
        { new: true, upsert: true }
      );
      students.push(student);
    }

    const titles = demoEvents(Date.now(), organizer._id, admin._id).map((event) => ({
      ...event,
      venue: 'Venue to be confirmed (demo)'
    }));
    const events = {};
    for (const data of titles) {
      events[data.title] = await Event.findOneAndUpdate(
        { title: data.title },
        { $setOnInsert: data },
        { new: true, upsert: true }
      );
    }

    await Promise.all([
      createDemoRegistration(events['DEMO: Maker Sprint — Build for a Better Campus'], students[0]),
      createDemoRegistration(events['DEMO: Friendly Football Round'], students[0], true),
      createDemoRegistration(events['DEMO: Friendly Football Round'], students[1]),
      createDemoRegistration(events['DEMO: Notes on Emerging Ideas'], students[1], true),
      createDemoRegistration(events['DEMO: The Open Studio'], students[2], true),
      createDemoRegistration(events['DEMO: The Open Studio'], students[4]),
      createDemoRegistration(events['DEMO: The Last Place Showcase'], students[3])
    ]);

    console.log('\n=== LOCAL DEMO ACCOUNTS ===');
    console.log(`Admin: ${admin.email} / use the password configured in server/.env`);
    console.log('Organizer: organizer@example.test / Organizer@123');
    console.log('Students: student1@example.test to student6@example.test / Student@123');
    console.log('All accounts, events and attendance are fictional local-only demo data.');
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1]?.endsWith('seed.js')) {
  seed()
    .then(() => {
      console.log('Local demo seed completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Local demo seed failed:', error.message);
      process.exit(1);
    });
}
