import { describe, it, expect, vi } from 'vitest';
import { logger } from './logger.js';

describe('Structured Logger', () => {
  it('redacts sensitive fields like password and token', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.info('User authentication attempt', {
      email: 'student@dsu.edu.in',
      password: 'SuperSecretPassword123!',
      token: 'jwt-header.payload.signature'
    });

    expect(logSpy).toHaveBeenCalled();
    const loggedMessage = logSpy.mock.calls[0][0];
    expect(loggedMessage).toContain('[REDACTED]');
    expect(loggedMessage).not.toContain('SuperSecretPassword123!');
    expect(loggedMessage).not.toContain('jwt-header.payload.signature');

    consoleSpy.mockRestore();
    logSpy.mockRestore();
  });
});

