import bcrypt from 'bcryptjs';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const day = 24 * 60 * 60 * 1000;

const initialEvents = (now, organizerId, adminId) => [
  {
    title: 'DSU HackGrid 2026: National Collegiate Hackathon',
    description: 'Flagship 36-hour collegiate hackathon bringing student innovators together to build AI systems, autonomous agents, IoT hardware, and decentralized solutions.',
    category: 'Technical',
    venue: 'CSE Innovation & Hackathon Lab, Harohalli Main Campus',
    startsAt: new Date(now + 3 * day),
    endsAt: new Date(now + 4 * day + 12 * 60 * 60 * 1000),
    capacity: 120,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'DSU Developer Student Club'
  },
  {
    title: 'Sir M. Visvesvaraya Memorial Technical Symposium',
    description: 'Annual research and engineering colloquium featuring keynote addresses by leading industry scientists, IEEE student track presentations, and robotics demos.',
    category: 'Seminar',
    venue: 'Sir M. Visvesvaraya Auditorium, Harohalli Main Campus',
    startsAt: new Date(now + 6 * day),
    endsAt: new Date(now + 6 * day + 8 * 60 * 60 * 1000),
    capacity: 500,
    status: 'published',
    createdBy: adminId,
    organizerClub: 'School of Engineering & Technology'
  },
  {
    title: 'Aakriti 2026: Annual University Cultural Fest',
    description: "Dayananda Sagar University's premier collegiate cultural extravaganza celebrating music, theatre, battle of bands, fashion showcases, and visual performing arts.",
    category: 'Cultural',
    venue: 'Harohalli Open-Air Amphitheater, Harohalli Main Campus',
    startsAt: new Date(now + 12 * day),
    endsAt: new Date(now + 14 * day),
    capacity: 500,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'DSU Cultural & Music Forum'
  },
  {
    title: "DSU Chancellor's Cup: Varsity Football Championship",
    description: 'Inter-collegiate varsity football tournament with regional university teams competing on Harohalli FIFA-standard synthetic turf under floodlights.',
    category: 'Sports',
    venue: 'Harohalli Athletics Complex & Central Turf',
    startsAt: new Date(now - 3 * day),
    endsAt: new Date(now - 3 * day + 4 * 60 * 60 * 1000),
    capacity: 350,
    status: 'published',
    createdBy: adminId,
    organizerClub: 'DSU Sports & Athletics Council'
  },
  {
    title: 'Generative Media & Autonomous Agents Masterclass',
    description: 'Hands-on advanced technical workshop exploring modern LLM architectures, local model inference, LangChain agent loops, and production vector indexing.',
    category: 'Workshop',
    venue: 'Dr. Premachandra Sagar Seminar Hall, Harohalli Main Campus',
    startsAt: new Date(now + 9 * day),
    endsAt: new Date(now + 9 * day + 4 * 60 * 60 * 1000),
    capacity: 150,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'DSU Robotics & Automation Society'
  },
  {
    title: 'School of Design Annual Prototype Sprint & UX Showcase',
    description: 'Collaborative product design sprint exploring human-centered UI/UX prototyping, spatial interactions, visual accessibility, and design system governance.',
    category: 'Workshop',
    venue: 'School of Design Creative Studio, Harohalli Main Campus',
    startsAt: new Date(now + 1 * day),
    endsAt: new Date(now + 1 * day + 6 * 60 * 60 * 1000),
    capacity: 60,
    status: 'published',
    createdBy: organizerId,
    organizerClub: 'DSU Design Guild'
  }
];

export async function seedIfEmpty() {
  const isProduction = env.NODE_ENV === 'production';
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return; // Already populated
  }

  // Production provisioning isolation
  if (isProduction) {
    console.log('[AutoSeed] Production environment detected.');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists && env.ADMIN_EMAIL && env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length >= 12) {
      console.log(`[AutoSeed] Provisioning master administrator for production: ${env.ADMIN_EMAIL.toLowerCase()}`);
      const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
      await User.create({
        name: 'University Registrar',
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: adminPasswordHash,
        role: 'admin',
        department: 'Registrar Office',
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date()
      });
      console.log('[AutoSeed] Production master administrator provisioned successfully.');
    }
    return;
  }

  console.log('[AutoSeed] Initializing Dayananda Sagar University campus baseline data...');

  const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  const admin = await User.create({
    name: 'University Registrar',
    email: env.ADMIN_EMAIL.toLowerCase(),
    passwordHash: adminPasswordHash,
    role: 'admin',
    department: 'Office of Student Affairs & Campus Life',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: new Date()
  });

  const organizerPasswordHash = await bcrypt.hash('Organizer@123', 12);
  const organizer = await User.create({
    name: 'Prof. Ramesh Kumar',
    email: 'organizer@dsu.edu.in',
    passwordHash: organizerPasswordHash,
    role: 'organizer',
    department: 'School of Computer Science & Engineering',
    clubName: 'DSU Developer Student Club',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: new Date()
  });

  // Keep compatibility organizer account for test suites
  await User.create({
    name: 'Faculty Coordinator',
    email: 'organizer@example.test',
    passwordHash: organizerPasswordHash,
    role: 'organizer',
    department: 'School of Engineering',
    clubName: 'DSU Technical Council',
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: new Date()
  });

  const studentPasswordHash = await bcrypt.hash('Student@123', 12);
  const studentProfiles = [
    { name: 'Rahul Sharma', email: 'rahul.sharma@dsu.edu.in', usn: '1DS23CS045', dept: 'School of Computer Science & Engineering' },
    { name: 'Ananya Rao', email: 'ananya.rao@dsu.edu.in', usn: '1DS23EC012', dept: 'Department of Electronics & Communication' },
    { name: 'Kavya S. Gowda', email: 'kavya.gowda@dsu.edu.in', usn: '1DS23CS088', dept: 'School of Computer Science & Engineering' },
    { name: 'Priya Verma', email: 'priya.verma@dsu.edu.in', usn: '1DS23AI019', dept: 'Department of Artificial Intelligence & Robotics' },
    { name: 'Karthik N.', email: 'karthik.n@dsu.edu.in', usn: '1DS23ME034', dept: 'Department of Mechanical Engineering' },
    { name: 'Aditi Joshi', email: 'aditi.joshi@dsu.edu.in', usn: '1DS23DS008', dept: 'School of Design & Creative Arts' }
  ];

  const students = [];
  for (const s of studentProfiles) {
    const student = await User.create({
      name: s.name,
      email: s.email,
      passwordHash: studentPasswordHash,
      role: 'student',
      department: s.dept,
      rollNumber: s.usn,
      usn: s.usn,
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date()
    });
    students.push(student);
  }

  // Pre-seed matching accounts for automated tests
  for (let i = 1; i <= 6; i++) {
    await User.create({
      name: `Student Applicant ${i}`,
      email: `student${i}@example.test`,
      passwordHash: studentPasswordHash,
      role: 'student',
      department: 'School of Computer Science & Engineering',
      rollNumber: `1DS23CS0${40 + i}`,
      usn: `1DS23CS0${40 + i}`,
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date()
    });
  }

  const events = [];
  for (const evData of initialEvents(Date.now(), organizer._id, admin._id)) {
    const ev = await Event.create(evData);
    events.push(ev);
  }

  // Pre-seed baseline registrations
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

  console.log('[AutoSeed] Dayananda Sagar University campus baseline data initialized successfully.');
}
