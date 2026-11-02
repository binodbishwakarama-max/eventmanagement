/**
 * DSU CAMPUS EVENTS — CONTROLLED UNIVERSITY PILOT SEEDING
 *
 * Configures the platform for a real-world controlled pilot:
 * - 2 Participating Student Clubs (DSU Developer Student Club & DSU Design Guild)
 * - 3 Official Pilot Campus Events
 * - 5 Verified Pilot Student Accounts for initial user onboarding
 */

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

export async function seedPilotEnvironment(customUri = null) {
  const uri = customUri || env.MONGODB_URI;
  console.log('[Pilot Seeder] Connecting to database...');

  const conn = mongoose.connection.readyState === 1
    ? mongoose.connection
    : await mongoose.connect(uri);

  console.log('[Pilot Seeder] Checking existing records...');
  
  // 1. Ensure Master Admin
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD || 'Admin@Pilot2026!', 12);
    admin = await User.create({
      name: 'DSU Registrar & Academic Dean Desk',
      email: env.ADMIN_EMAIL || 'registrar.pilot@dsu.edu.in',
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'Office of the Registrar, Harohalli Campus',
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date()
    });
    console.log(`  ✔ Provisioned Pilot Admin: ${admin.email}`);
  }

  // 2. Provision 2 Participating Student Club Organizers
  const organizer1PasswordHash = await bcrypt.hash('DSC@Advisor2026', 12);
  let org1 = await User.findOne({ email: 'dsc.advisor@dsu.edu.in' });
  if (!org1) {
    org1 = await User.create({
      name: 'Dr. Ramesh K. (Faculty Advisor)',
      email: 'dsc.advisor@dsu.edu.in',
      passwordHash: organizer1PasswordHash,
      role: 'organizer',
      department: 'School of Computer Science & Engineering',
      clubName: 'DSU Developer Student Club',
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      verifiedBy: admin._id
    });
    console.log(`  ✔ Provisioned Club 1 Organizer: ${org1.email} (${org1.clubName})`);
  }

  const organizer2PasswordHash = await bcrypt.hash('Design@Lead2026', 12);
  let org2 = await User.findOne({ email: 'design.lead@dsu.edu.in' });
  if (!org2) {
    org2 = await User.create({
      name: 'Prof. Ananya Sen (Faculty Coordinator)',
      email: 'design.lead@dsu.edu.in',
      passwordHash: organizer2PasswordHash,
      role: 'organizer',
      department: 'School of Design & Creative Arts',
      clubName: 'DSU Design Guild',
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      verifiedBy: admin._id
    });
    console.log(`  ✔ Provisioned Club 2 Organizer: ${org2.email} (${org2.clubName})`);
  }

  // 3. Provision 3 Official Pilot Events
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const pilotEvents = [
    {
      title: 'HackForge 2026: Campus IoT & AI Sprint',
      description: 'An intensive 24-hour hardware and software maker sprint for DSU engineering scholars. Teams prototype smart energy monitors, automated campus transport trackers, and computer vision safety nodes.',
      category: 'Technical',
      venue: 'CSE Innovation Lab, Block 3, Harohalli Campus',
      startsAt: new Date(now + 4 * day),
      endsAt: new Date(now + 5 * day),
      capacity: 35,
      status: 'published',
      createdBy: org1._id,
      organizerClub: 'DSU Developer Student Club'
    },
    {
      title: 'Design Systems & Interaction Lab',
      description: 'Master typography hierarchies, spatial scales, and iOS HIG design tokens. Learn hands-on component structuring in Figma and React component parity.',
      category: 'Workshop',
      venue: 'School of Design Studio, 4th Floor, Academic Block',
      startsAt: new Date(now + 6 * day),
      endsAt: new Date(now + 6 * day + 4 * 60 * 60 * 1000),
      capacity: 25,
      status: 'published',
      createdBy: org2._id,
      organizerClub: 'DSU Design Guild'
    },
    {
      title: 'Colloquium: Next-Gen Autonomous Systems',
      description: 'Distinguished university research seminar exploring autonomous robotics, edge perception models, and real-time sensor fusion.',
      category: 'Seminar',
      venue: 'Sir M. Visvesvaraya Auditorium, Harohalli',
      startsAt: new Date(now + 9 * day),
      endsAt: new Date(now + 9 * day + 3 * 60 * 60 * 1000),
      capacity: 50,
      status: 'published',
      createdBy: org1._id,
      organizerClub: 'DSU Developer Student Club'
    }
  ];

  for (const evData of pilotEvents) {
    const existing = await Event.findOne({ title: evData.title });
    if (!existing) {
      const created = await Event.create(evData);
      console.log(`  ✔ Created Pilot Event: "${created.title}" (Capacity: ${created.capacity}, Venue: ${created.venue})`);
    } else {
      console.log(`  ℹ Existing Pilot Event: "${existing.title}"`);
    }
  }

  // 4. Provision 5 Initial Verified Pilot Students
  const studentPasswordHash = await bcrypt.hash('Student@Pilot2026!', 12);
  const pilotStudents = [
    { name: 'Kavya S. Gowda', usn: '1DS23CS045', email: 'kavya.gowda@dsu.edu.in', dept: 'School of Computer Science & Engineering' },
    { name: 'Aditya R. Nair', usn: '1DS23CS012', email: 'aditya.nair@dsu.edu.in', dept: 'School of Computer Science & Engineering' },
    { name: 'Meera P. Rao', usn: '1DS23AI018', email: 'meera.rao@dsu.edu.in', dept: 'Department of AI & Data Science' },
    { name: 'Rohan V. Kulkarni', usn: '1DS23EC089', email: 'rohan.kulkarni@dsu.edu.in', dept: 'School of Electronics & Communication' },
    { name: 'Sneha B. Deshpande', usn: '1DS23ME034', email: 'sneha.deshpande@dsu.edu.in', dept: 'School of Mechanical Engineering' }
  ];

  for (const stu of pilotStudents) {
    const existing = await User.findOne({ email: stu.email });
    if (!existing) {
      await User.create({
        name: stu.name,
        email: stu.email,
        passwordHash: studentPasswordHash,
        role: 'student',
        usn: stu.usn,
        rollNumber: stu.usn,
        department: stu.dept,
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        verifiedBy: admin._id
      });
      console.log(`  ✔ Provisioned Verified Pilot Student: ${stu.name} (${stu.usn})`);
    }
  }

  console.log('\n[Pilot Seeder] Pilot environment initialization complete.');
  console.log('• 2 Participating Student Clubs active');
  console.log('• 3 Verified Pilot Events published');
  console.log('• 5 Pilot Students onboarded and verified');
}

if (process.argv[1]?.endsWith('seed-pilot.js')) {
  seedPilotEnvironment()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Pilot Seeder FATAL]', err.message);
      process.exit(1);
    });
}

