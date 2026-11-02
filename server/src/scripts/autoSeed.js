import bcrypt from 'bcryptjs';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const day = 24 * 60 * 60 * 1000;

const initialEvents = (now, organizerId, adminId) => [
  {
    title: 'Inter-Department Friendly Football Round',
    description: 'Knockout football match between Schools of Engineering and Basic Sciences. Spectators and student cheering squads welcome.',
    category: 'Sports',
    venue: 'DSU Sports Arena & Central Ground',
    startsAt: new Date(now + 2 * day),
    endsAt: new Date(now + 2 * day + 3 * 60 * 60 * 1000),
    capacity: 50,
    status: 'published',
    createdBy: adminId,
    organizerClub: 'DSU Athletics Council'
  },
  {
    title: 'Maker Sprint — Build for a Better Campus',
    description: 'A 24-hour hands-on hardware and software sprint for engineering students. Teams build smart IoT prototypes, automated campus solutions, and accessibility tools.',
    category: 'Technical',
    venue: 'CSE Innovation Lab, Block 3, Harohalli Campus',
    startsAt: new Date(now + 3 * day),
    endsAt: new Date(now + 4 * day),
    capacity: 30,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'DSU Developer Student Club'
  },
  {
    title: 'Shape, Type & Interface Design Workshop',
    description: 'Master typographic rhythm, spatial scales, and iOS HIG design systems. Learn hands-on micro-interaction engineering and component tokens.',
    category: 'Workshop',
    venue: 'School of Design Studio, 4th Floor, Academic Block',
    startsAt: new Date(now + 7 * day),
    endsAt: new Date(now + 7 * day + 4 * 60 * 60 * 1000),
    capacity: 24,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'DSU Design Guild'
  },
  {
    title: 'Notes on Emerging Ideas in Tech & AI',
    description: 'Distinguished faculty lecture and research colloquium exploring large reasoning models, agentic workflows, and ethical considerations for university researchers.',
    category: 'Seminar',
    venue: 'Sir M. Visvesvaraya Auditorium, Harohalli',
    startsAt: new Date(now + 9 * day),
    endsAt: new Date(now + 9 * day + 2 * 60 * 60 * 1000),
    capacity: 80,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'Faculty of Engineering & Technology'
  },
  {
    title: 'The Open Creative Studio',
    description: 'Hands-on exploratory session with generative visuals, creative coding, and collaborative design sprints for aspiring campus creators.',
    category: 'Workshop',
    venue: 'Student Activity Center, Harohalli Campus',
    startsAt: new Date(now + 10 * day),
    endsAt: new Date(now + 10 * day + 4 * 60 * 60 * 1000),
    capacity: 25,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'Creative Arts Club'
  },
  {
    title: 'Open Stage Sessions & Cultural Night',
    description: 'An evening of live student performances, acoustic solos, spoken word poetry, and instrumental music celebrating creative expressions across all schools.',
    category: 'Cultural',
    venue: 'Campus Open Air Amphitheatre, Harohalli',
    startsAt: new Date(now + 14 * day),
    endsAt: new Date(now + 14 * day + 5 * 60 * 60 * 1000),
    capacity: 60,
    status: 'published',
    createdBy: adminId,
    organizerClub: 'Music & Cultural Society'
  }
];

export async function seedIfEmpty() {
  const isProduction = env.NODE_ENV === 'production';
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return; // Already populated
  }

  // PRIORITY 5: PRODUCTION SEEDING ISOLATION
  // Never seed demo students, hardcoded organizer credentials, or test events into production!
  if (isProduction) {
    console.log('[AutoSeed] Production environment detected. Skipping demo student & organizer seeding.');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists && env.ADMIN_EMAIL && env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length >= 12) {
      console.log(`[AutoSeed] Provisioning master administrator for production: ${env.ADMIN_EMAIL.toLowerCase()}`);
      const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
      await User.create({
        name: 'University Administration Desk',
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: adminPasswordHash,
        role: 'admin',
        department: 'Registrar Office',
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date()
      });
      console.log('[AutoSeed] Production master administrator provisioned successfully.');
    } else if (!adminExists) {
      console.warn('[AutoSeed Warning] Master administrator not yet provisioned. Run "npm run provision-admin" with secure credentials.');
    }
    return;
  }

  console.log('[AutoSeed] Development mode: Seeding verified DSU institutional accounts and events...');

  const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  const admin = await User.create({
    name: 'University Administration Desk',
    email: env.ADMIN_EMAIL.toLowerCase(),
    passwordHash: adminPasswordHash,
    role: 'admin',
    department: 'Registrar Office'
  });

  const organizerPasswordHash = await bcrypt.hash('Organizer@123', 12);
  const organizer = await User.create({
    name: 'Prof. Ramesh K. (Faculty Advisor)',
    email: 'organizer@example.test',
    passwordHash: organizerPasswordHash,
    role: 'organizer',
    department: 'Department of Computer Science & Engineering',
    clubName: 'DSU Developer Student Club'
  });

  const studentPasswordHash = await bcrypt.hash('Student@123', 12);
  const students = [];
  for (let i = 1; i <= 6; i++) {
    const student = await User.create({
      name: `DSU Scholar ${i}`,
      email: `student${i}@example.test`,
      passwordHash: studentPasswordHash,
      role: 'student',
      department: 'School of Engineering',
      rollNumber: `1DS22CS0${40 + i}`,
      usn: `1DS22CS0${40 + i}`
    });
    students.push(student);
  }

  const events = [];
  for (const evData of initialEvents(Date.now(), organizer._id, admin._id)) {
    const ev = await Event.create(evData);
    events.push(ev);
  }

  // Pre-seed initial registrations for testing
  if (events.length > 0 && students.length > 0) {
    await Registration.create({
      event: events[0]._id,
      student: students[0]._id,
      status: 'registered'
    });
    await Event.findByIdAndUpdate(events[0]._id, { $inc: { registeredCount: 1 } });

    await Registration.create({
      event: events[1]._id,
      student: students[0]._id,
      status: 'registered'
    });
    await Event.findByIdAndUpdate(events[1]._id, { $inc: { registeredCount: 1 } });

    await Registration.create({
      event: events[1]._id,
      student: students[1]._id,
      status: 'registered'
    });
    await Event.findByIdAndUpdate(events[1]._id, { $inc: { registeredCount: 1 } });
  }

  console.log('[AutoSeed] Seed completed successfully: 1 admin, 1 organizer, 6 students, 6 official events.');
}

