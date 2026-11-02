import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import {
  registerUser
} from '../src/modules/auth/auth.service.js';
import {
  listUsers,
  updateUserVerification,
  resubmitStudentVerification
} from '../src/modules/users/users.service.js';

describe('Student Account Review, Approval, Rejection & Resubmission Lifecycle', () => {
  it('manages student identity verification queue, rejection audit trail, and resubmission', async () => {
    const memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);

    try {
      // 1. Provision an administrator
      const admin = await User.create({
        name: 'Dean Academic Affairs',
        email: 'dean.academics@dsu.edu.in',
        passwordHash: '$2a$12$DUMMYHASHDUMMYHASHDUMMYHASH',
        role: 'admin',
        isVerified: true,
        verificationStatus: 'verified'
      });

      // 2. Student registers with a USN
      const reg = await registerUser({
        name: 'Pooja Hegde',
        email: 'pooja.hegde@dsu.edu.in',
        password: 'Password@123',
        usn: '1DS23CS077',
        department: 'School of Computer Science & Engineering'
      });

      const studentId = reg.user._id;

      // Invariant: Submitted USN/email is NOT automatically trusted
      expect(reg.user.isVerified).toBe(false);
      expect(reg.user.verificationStatus).toBe('pending');

      // 3. Admin reviews verification queue (filter by pending)
      const pendingList = await listUsers({ verificationStatus: 'pending' });
      expect(pendingList.items.some(u => u._id.toString() === studentId.toString())).toBe(true);

      // 4. Admin rejects student verification with reason
      const rejectedUser = await updateUserVerification(
        studentId,
        {
          status: 'rejected',
          rejectionReason: 'USN does not match registrar enrollment sheet for CSE 2023-27 batch.'
        },
        admin
      );

      expect(rejectedUser.isVerified).toBe(false);
      expect(rejectedUser.verificationStatus).toBe('rejected');
      expect(rejectedUser.rejectionReason).toBe('USN does not match registrar enrollment sheet for CSE 2023-27 batch.');
      expect(rejectedUser.verifiedBy.toString()).toBe(admin._id.toString());

      // 5. Student resubmits corrected credentials
      const resubmittedUser = await resubmitStudentVerification(
        studentId,
        {
          usn: '1DS23CS078',
          department: 'School of Computer Science & Engineering'
        }
      );

      expect(resubmittedUser.usn).toBe('1DS23CS078');
      expect(resubmittedUser.verificationStatus).toBe('pending');
      expect(resubmittedUser.rejectionReason).toBe('');

      // 6. Admin approves verification
      const approvedUser = await updateUserVerification(
        studentId,
        { status: 'verified' },
        admin
      );

      expect(approvedUser.isVerified).toBe(true);
      expect(approvedUser.verificationStatus).toBe('verified');
      expect(approvedUser.verifiedAt).toBeInstanceOf(Date);
      expect(approvedUser.verifiedBy.toString()).toBe(admin._id.toString());
    } finally {
      await mongoose.disconnect();
      await memoryServer.stop();
    }
  });
});

