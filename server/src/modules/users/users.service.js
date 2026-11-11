import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';
import { DSU_USN_REGEX } from '../auth/auth.schemas.js';

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function listUsers(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const filter = {};

  if (query.role) filter.role = query.role;
  if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
  if (query.search) {
    const search = { $regex: escapeRegex(query.search), $options: 'i' };
    filter.$or = [{ name: search }, { email: search }, { department: search }, { clubName: search }, { usn: search }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select('name email role department clubName usn rollNumber isVerified verificationStatus rejectionReason verifiedAt verifiedBy createdAt')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export async function updateUserVerification(userId, { status, role, rejectionReason }, adminUser) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (status) {
    user.verificationStatus = status;
    if (status === 'verified') {
      user.isVerified = true;
      user.verifiedAt = new Date();
      user.verifiedBy = adminUser._id;
      user.rejectionReason = '';
    } else if (status === 'rejected') {
      user.isVerified = false;
      user.verifiedAt = null;
      user.verifiedBy = adminUser._id;
      user.rejectionReason = rejectionReason || 'Institutional USN or identity records could not be verified by registrar desk';
    } else if (status === 'pending') {
      user.isVerified = false;
      user.verifiedAt = null;
      user.rejectionReason = '';
    }
  }

  if (role && ['student', 'organizer', 'admin'].includes(role)) {
    // Prevent self-demotion
    if (adminUser && user._id.equals(adminUser._id) && role !== 'admin') {
      throw ApiError.badRequest('Administrators cannot demote their own account role.');
    }
    // Prevent demoting primary administrator
    if (user.email === env.ADMIN_EMAIL && role !== 'admin') {
      throw ApiError.badRequest('The primary institutional root administrator account cannot be demoted.');
    }
    user.role = role;
  }

  await user.save();
  return user;
}

export async function resubmitStudentVerification(userId, { usn, department, idCardDocumentUrl }) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const normalizedUsn = (usn || '').toUpperCase().trim();
  if (!DSU_USN_REGEX.test(normalizedUsn)) {
    throw ApiError.badRequest('Invalid Dayananda Sagar University USN format. Example: 1DS23CS045');
  }

  user.usn = normalizedUsn;
  user.rollNumber = normalizedUsn;
  if (department) user.department = department.trim();
  if (idCardDocumentUrl) user.idCardDocumentUrl = idCardDocumentUrl;

  user.verificationStatus = 'pending';
  user.isVerified = false;
  user.rejectionReason = '';
  await user.save();

  return user;
}
