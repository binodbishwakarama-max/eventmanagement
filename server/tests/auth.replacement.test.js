import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { bootstrapSuperAdmin } from '../src/scripts/provision-superadmin.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
}, 30000);

describe('Production Authentication & Identity Replacement Suite', () => {
  let studentToken = null;
  let studentUser = null;
  let adminToken = null;

  it('Test Case 1: creates a new real database user on first Google login', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_001:eng25cs0999@dsu.edu.in:Anand Verma:true'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isNew).toBe(true);
    expect(res.body.data.user.email).toBe('eng25cs0999@dsu.edu.in');
    expect(res.body.data.user.role).toBe('student'); // Strictly student default
    expect(res.body.data.user.googleId).toBe('google_sub_001');
    expect(res.body.data.user.isEmailVerified).toBe(true);

    studentToken = res.body.data.token;
    studentUser = res.body.data.user;

    // Verify persisted in real database
    const userId = studentUser._id || studentUser.id;
    const dbUser = await User.findById(userId);
    expect(dbUser).not.toBeNull();
    expect(dbUser.googleId).toBe('google_sub_001');
  });

  it('Test Case 2: authenticates existing Google account without duplicating user record', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_001:eng25cs0999@dsu.edu.in:Anand Verma:true'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.isNew).toBe(false);
    const userId = studentUser._id || studentUser.id;
    expect(res.body.data.user._id || res.body.data.user.id).toBe(userId);

    const count = await User.countDocuments({ email: 'eng25cs0999@dsu.edu.in' });
    expect(count).toBe(1);
  });

  it('Test Case 3: securely links existing local account to Google identity', async () => {
    // Create an existing unlinked user (e.g. prior registration)
    await User.create({
      name: 'Faculty Coordinator',
      email: 'coordinator@dsu.edu.in',
      role: 'organizer',
      isEmailVerified: false,
      tokenVersion: 1
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_org_01:coordinator@dsu.edu.in:Prof. Rao:true'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('organizer'); // Retains existing role
    expect(res.body.data.user.googleId).toBe('google_sub_org_01');
    expect(res.body.data.user.isEmailVerified).toBe(true);
  });

  it('Test Case 4: rejects Google token with unverified email', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_unv:fake@dsu.edu.in:Bad Actor:false'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Test Case 5: rejects domain violation when non-institutional domain is submitted', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_ext:attacker@gmail.com:External User:true'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('restricted to institutional');
  });

  it('Test Case 6: blocks student from accessing admin endpoints (RBAC)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('insufficient role permissions');
  });

  it('Test Case 7: allows self-service profile inspection via /api/users/me', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('eng25cs0999@dsu.edu.in');
    expect(res.body.data.role).toBe('student');
  });

  it('Test Case 8: allows self-service permitted profile updates but rejects role modification', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        name: 'Anand V. Kumar',
        department: 'School of Computer Science & Engineering',
        role: 'admin' // Attempted privilege escalation
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Anand V. Kumar');

    // Role MUST remain student
    const userId = studentUser._id || studentUser.id;
    const dbUser = await User.findById(userId);
    expect(dbUser.role).toBe('student');
  });

  it('Test Case 9: provisions Super Administrator via CLI bootstrap tool', async () => {
    await bootstrapSuperAdmin({ email: 'superadmin@dsu.edu.in', name: 'Vice Chancellor Desk' });

    const superAdmin = await User.findOne({ email: 'superadmin@dsu.edu.in' });
    expect(superAdmin).not.toBeNull();
    expect(superAdmin.role).toBe('super_admin');
    expect(superAdmin.isVerified).toBe(true);

    // Login via Google with provisioned superadmin identity
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_sa:superadmin@dsu.edu.in:Vice Chancellor:true'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('super_admin');
    adminToken = res.body.data.token;
  });

  it('Test Case 10: allows Super Administrator to view administrative user list', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('Test Case 11: blocks unauthorized role promotion by normal admin against super_admin', async () => {
    // Create regular admin
    const regularAdmin = await User.create({
      name: 'Campus Admin',
      email: 'admin_regular@dsu.edu.in',
      role: 'admin',
      isVerified: true,
      tokenVersion: 1
    });

    const regularAdminRes = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_ra:admin_regular@dsu.edu.in:Campus Admin:true'
      });

    const regToken = regularAdminRes.body.data.token;

    // Regular admin tries to demote super_admin
    const targetSuperAdmin = await User.findOne({ role: 'super_admin' });
    const res = await request(app)
      .patch(`/api/admin/users/${targetSuperAdmin._id}/verify`)
      .set('Authorization', `Bearer ${regToken}`)
      .send({
        role: 'student'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Cannot modify a Super Administrator');
  });

  it('Test Case 12: revokes all active sessions across all devices on logout-all', async () => {
    // First, verify current token works
    const check1 = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(check1.status).toBe(200);

    // Call logout-all
    const logoutRes = await request(app)
      .post('/api/auth/logout-all')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(logoutRes.status).toBe(200);

    // Old token MUST now be rejected with 401 Unauthorized
    const check2 = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(check2.status).toBe(401);
    expect(check2.body.message).toContain('Session has been revoked');
  });

  it('Test Case 13: rejects suspended accounts immediately upon request', async () => {
    // Suspend the student user in DB
    const userId = studentUser._id || studentUser.id;
    await User.findByIdAndUpdate(userId, { accountStatus: 'suspended' });

    // Generate fresh token
    const loginRes = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_001:eng25cs0999@dsu.edu.in:Anand Verma:true'
      });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.message).toContain('suspended');
  });

  it('Test Case 14: self-service account deactivation revokes all sessions', async () => {
    // Create new student
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        credential: 'test-google-token:google_sub_deact:eng25cs0101@dsu.edu.in:Student Deact:true'
      });
    const deactToken = res.body.data.token;

    // Deactivate account
    const deactRes = await request(app)
      .post('/api/users/me/deactivate')
      .set('Authorization', `Bearer ${deactToken}`);
    expect(deactRes.status).toBe(200);

    // Verify token is rejected immediately
    const check = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${deactToken}`);
    expect(check.status).toBe(401);
  });
});
