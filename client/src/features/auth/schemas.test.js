import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from './schemas.js';

describe('Auth Boundary Schemas', () => {
  describe('loginSchema', () => {
    it('validates proper login credentials', () => {
      const res = loginSchema.safeParse({
        email: 'student@dsu.edu.in',
        password: 'Password123'
      });
      expect(res.success).toBe(true);
    });

    it('rejects malformed email', () => {
      const res = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'Password123'
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('valid email');
      }
    });

    it('rejects short passwords', () => {
      const res = loginSchema.safeParse({
        email: 'student@dsu.edu.in',
        password: '123'
      });
      expect(res.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid DSU student registration', () => {
      const res = registerSchema.safeParse({
        name: 'Aarav Sharma',
        email: 'aarav.sharma@dsu.edu.in',
        password: 'Password1',
        usn: '1DS23CS045',
        department: 'School of Engineering - Computer Science'
      });
      expect(res.success).toBe(true);
    });

    it('rejects non-institutional emails', () => {
      const res = registerSchema.safeParse({
        name: 'Aarav Sharma',
        email: 'aarav@gmail.com',
        password: 'Password1',
        usn: '1DS23CS045',
        department: 'School of Engineering'
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('Dayananda Sagar University email');
      }
    });

    it('rejects malformed USN', () => {
      const res = registerSchema.safeParse({
        name: 'Aarav Sharma',
        email: 'aarav@dsu.edu.in',
        password: 'Password1',
        usn: 'INVALID_USN',
        department: 'School of Engineering'
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('USN format');
      }
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates matching passwords', () => {
      const res = resetPasswordSchema.safeParse({
        newPassword: 'NewPassword1',
        confirmPassword: 'NewPassword1'
      });
      expect(res.success).toBe(true);
    });

    it('rejects non-matching passwords', () => {
      const res = resetPasswordSchema.safeParse({
        newPassword: 'NewPassword1',
        confirmPassword: 'MismatchPassword2'
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('Passwords do not match');
      }
    });
  });
});

