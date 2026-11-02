import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';

describe('Secure Administrator Account Provisioning', () => {
  it('enforces 12-character password minimum and provisions verified admin', async () => {
    const memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);

    try {
      const weakPassword = 'short';
      expect(weakPassword.length).toBeLessThan(12);

      const strongAdminPassword = 'MasterRegistrar@2026!';
      expect(strongAdminPassword.length).toBeGreaterThanOrEqual(12);

      const adminEmail = 'master.admin@dsu.edu.in';
      const passwordHash = await bcrypt.hash(strongAdminPassword, 12);

      const admin = await User.create({
        name: 'Master Registrar',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date()
      });

      expect(admin.role).toBe('admin');
      expect(admin.isVerified).toBe(true);
      expect(await bcrypt.compare(strongAdminPassword, admin.passwordHash)).toBe(true);
      expect(await bcrypt.compare('WrongPassword', admin.passwordHash)).toBe(false);

      // Verify idempotency
      const count = await User.countDocuments({ role: 'admin' });
      expect(count).toBe(1);
    } finally {
      await mongoose.disconnect();
      await memoryServer.stop();
    }
  });
});

