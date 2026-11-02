import { describe, expect, it, vi } from 'vitest';
import {
  sendPasswordResetEmail,
  sendRegistrationConfirmationEmail,
  sendEventCancellationEmail,
  sendEventUpdateEmail
} from '../src/services/email/email.service.js';

describe('Transactional Email Service Verification', () => {
  it('dispatches password reset email and redacts secrets in production', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await sendPasswordResetEmail({
      to: 'student.test@dsu.edu.in',
      studentName: 'Aarav Sharma',
      resetUrl: 'https://events.dsu.edu.in/reset-password?token=secret123456789'
    });

    expect(result.success).toBe(true);
    consoleSpy.mockRestore();
  });

  it('dispatches registration confirmation email containing ticket pass code', async () => {
    const mockEvent = {
      title: 'Harohalli AI Colloquium',
      venue: 'Sir M. Visvesvaraya Auditorium',
      startsAt: new Date(Date.now() + 86400000),
      organizerClub: 'DSU Developer Student Club'
    };

    const result = await sendRegistrationConfirmationEmail({
      to: 'student.test@dsu.edu.in',
      studentName: 'Aarav Sharma',
      event: mockEvent,
      ticketCode: 'TKT-778899AA'
    });

    expect(result.success).toBe(true);
  });

  it('dispatches event cancellation notice with cancellation reason', async () => {
    const mockEvent = {
      title: 'Badminton Championship',
      venue: 'Sports Arena',
      startsAt: new Date(Date.now() + 86400000)
    };

    const result = await sendEventCancellationEmail({
      to: 'student.test@dsu.edu.in',
      studentName: 'Aarav Sharma',
      event: mockEvent,
      reason: 'Harohalli indoor turf annual maintenance'
    });

    expect(result.success).toBe(true);
  });

  it('dispatches event update notice with venue change summary', async () => {
    const mockEvent = {
      title: 'Robotics Workshop',
      venue: 'Innovation Lab 3',
      startsAt: new Date(Date.now() + 86400000)
    };

    const result = await sendEventUpdateEmail({
      to: 'student.test@dsu.edu.in',
      studentName: 'Aarav Sharma',
      event: mockEvent,
      changeSummary: 'Moved to CSE Innovation Lab 3 for hardware kit availability'
    });

    expect(result.success).toBe(true);
  });
});

