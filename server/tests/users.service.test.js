import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/models/User.js', () => ({
  User: {
    find: vi.fn(),
    countDocuments: vi.fn()
  }
}));

import { User } from '../src/models/User.js';
import { listUsers } from '../src/modules/users/users.service.js';

describe('admin user listing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const query = {
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ name: 'Demo Student', role: 'student' }])
    };
    User.find.mockReturnValue(query);
    User.countDocuments.mockResolvedValue(1);
  });

  it('paginates search results and selects only safe profile fields', async () => {
    const result = await listUsers({
      search: 'student',
      role: 'student',
      page: 2,
      limit: 10
    });

    const [filter] = User.find.mock.calls[0];
    expect(filter.role).toBe('student');
    expect(filter.$or[0].name).toEqual({ $regex: 'student', $options: 'i' });
    expect(User.find.mock.results[0].value.select).toHaveBeenCalledWith(
      'name email role department clubName usn rollNumber isVerified verificationStatus rejectionReason verifiedAt verifiedBy createdAt'
    );
    expect(result).toMatchObject({ page: 2, limit: 10, total: 1, totalPages: 1 });
  });
});
