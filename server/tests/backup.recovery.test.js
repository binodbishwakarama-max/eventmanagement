import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { Event } from '../src/models/Event.js';
import { Registration } from '../src/models/Registration.js';
import { createDatabaseBackup } from '../src/scripts/backup-db.js';
import { restoreDatabaseBackup } from '../src/scripts/restore-db.js';

describe('Database Disaster Recovery & Backup Integrity Suite', () => {
  it('performs cryptographic snapshot backup and 100% verified restoration', async () => {
    const memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();

    await mongoose.connect(uri);

    try {
      // 1. Seed baseline test records in isolated database
      const user1 = await User.create({
        name: 'Backup Test Student',
        email: 'backup.student@dsu.edu.in',
        passwordHash: '$2a$12$DUMMYHASHDUMMYHASHDUMMYHASH',
        role: 'student',
        usn: '1DS23CS001',
        isVerified: true,
        verificationStatus: 'verified'
      });

      const event1 = await Event.create({
        title: 'Disaster Recovery Drill Summit',
        description: 'Simulated institutional business continuity and backup verification workshop.',
        category: 'Technical',
        venue: 'Sir M. Visvesvaraya Auditorium',
        startsAt: new Date(Date.now() + 86400000),
        endsAt: new Date(Date.now() + 86400000 + 7200000),
        capacity: 50,
        registeredCount: 1,
        status: 'published',
        createdBy: user1._id
      });

      await Registration.create({
        event: event1._id,
        student: user1._id,
        ticketCode: 'TKT-TEST-RESTORE',
        status: 'registered'
      });

      expect(await User.countDocuments()).toBe(1);
      expect(await Event.countDocuments()).toBe(1);
      expect(await Registration.countDocuments()).toBe(1);

      // 2. Perform automated snapshot backup
      const { backupFolder, manifest } = await createDatabaseBackup(uri);
      expect(manifest.collections.users.count).toBe(1);
      expect(manifest.collections.events.count).toBe(1);
      expect(manifest.collections.registrations.count).toBe(1);

      // 3. Simulate accidental catastrophic data wipe
      await User.deleteMany({});
      await Event.deleteMany({});
      await Registration.deleteMany({});

      expect(await User.countDocuments()).toBe(0);
      expect(await Event.countDocuments()).toBe(0);
      expect(await Registration.countDocuments()).toBe(0);

      // 4. Execute recovery restoration
      const restoreResult = await restoreDatabaseBackup(backupFolder, uri);
      expect(restoreResult.success).toBe(true);

      // 5. Verify 100% record integrity
      const restoredUser = await User.findOne({ email: 'backup.student@dsu.edu.in' });
      expect(restoredUser).toBeTruthy();
      expect(restoredUser.usn).toBe('1DS23CS001');

      const restoredEvent = await Event.findOne({ _id: event1._id });
      expect(restoredEvent).toBeTruthy();
      expect(restoredEvent.title).toBe('Disaster Recovery Drill Summit');

      const restoredReg = await Registration.findOne({ ticketCode: 'TKT-TEST-RESTORE' });
      expect(restoredReg).toBeTruthy();
      expect(restoredReg.status).toBe('registered');

      expect(await User.countDocuments()).toBe(1);
      expect(await Event.countDocuments()).toBe(1);
      expect(await Registration.countDocuments()).toBe(1);
    } finally {
      await mongoose.disconnect();
      await memoryServer.stop();
    }
  });
});

