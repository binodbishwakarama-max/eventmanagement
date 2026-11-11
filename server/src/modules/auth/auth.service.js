import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { DSU_USN_REGEX } from './auth.schemas.js';
import { parseDsuIdentity } from '../../utils/dsuRollParser.js';
import { sendPasswordResetEmail } from '../../services/email/email.service.js';
import { verifyGoogleIdToken, exchangeGoogleAuthCode } from '../../services/googleAuth.service.js';

const DUMMY_HASH = '$2a$12$e8YkZJ3.0G7xUqmYqF/8Iea1i7bTf75/4r1oXfQeH8/Lkm23Z9YGy';

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
      v: user.tokenVersion || 1
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
}

export async function registerUser(data) {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Institutional domain check in production
  if (env.NODE_ENV === 'production' && env.ALLOWED_EMAIL_DOMAINS) {
    const allowed = env.ALLOWED_EMAIL_DOMAINS.split(',').map((d) => d.trim().toLowerCase());
    const domain = data.email.toLowerCase().split('@')[1];
    if (!allowed.includes(domain)) {
      throw ApiError.badRequest(`Registration is restricted to institutional accounts (@${allowed.join(', @')})`);
    }
  }

  const usnInput = (data.usn || data.rollNumber || '').toUpperCase().trim();
  if (usnInput && !DSU_USN_REGEX.test(usnInput)) {
    throw ApiError.badRequest('Invalid Dayananda Sagar University USN format. Example: 1DS23CS045');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  // Academic Identity Review Queue: Never automatically trust self-submitted USN or email.
  // Registrations enter the administrator review queue as 'pending'.
  const verificationStatus = usnInput ? 'pending' : 'unverified';
  const isVerified = false;

  const user = await User.create({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash,
    role: 'student', // Public registration is strictly student role
    department: data.department || '',
    rollNumber: usnInput,
    usn: usnInput,
    isVerified,
    verificationStatus,
    verifiedAt: null,
    tokenVersion: 1
  });

  const token = signToken(user);
  return { token, user: user.toJSON() };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !match) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken(user);
  return { token, user: user.toJSON() };
}

export async function googleLoginOrRegister({ credential, code, usn }) {
  // 1. Authenticate cryptographically against Google Accounts API
  const googleUser = code
    ? await exchangeGoogleAuthCode(code)
    : await verifyGoogleIdToken(credential);

  const { sub: googleId, email, name, picture } = googleUser;
  const normalizedEmail = email.toLowerCase().trim();

  // 2. Enforce Institutional domain check (configurable via env)
  if (env.ALLOWED_EMAIL_DOMAINS && env.ALLOWED_EMAIL_DOMAINS !== '*') {
    const allowed = env.ALLOWED_EMAIL_DOMAINS.split(',').map((d) => d.trim().toLowerCase());
    const domain = normalizedEmail.split('@')[1];
    if (!allowed.includes(domain)) {
      throw ApiError.forbidden(`Access restricted to institutional Google accounts (@${allowed.join(', @')})`);
    }
  }

  // 3. Find existing account by googleId OR by verified email
  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.findOne({ email: normalizedEmail });
    if (user) {
      // Securely link existing account with Google identity
      user.googleId = googleId;
      user.isEmailVerified = true;
      if (!user.avatarUrl && picture) user.avatarUrl = picture;
      await user.save();
    }
  }

  // 4. Create new real account if it does not exist
  let isNew = false;
  if (!user) {
    // Auto-detect USN and department from institutional email pattern
    const parsedIdentity = parseDsuIdentity(normalizedEmail);
    const detectedUsn = (usn || parsedIdentity?.usn || normalizedEmail.split('@')[0]).toUpperCase().trim();
    const detectedDepartment = parsedIdentity?.department || 'School of Engineering & Technology';

    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      googleId,
      authProvider: 'google',
      role: 'student', // Strictly 'student' by default for all public self-registrations
      accountStatus: 'active',
      isEmailVerified: true,
      avatarUrl: picture || '',
      department: detectedDepartment,
      rollNumber: detectedUsn,
      usn: detectedUsn,
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      lastLoginAt: new Date(),
      tokenVersion: 1
    });
    isNew = true;
  } else {
    // Check if account has been suspended or deactivated
    if (user.accountStatus === 'suspended') {
      throw ApiError.forbidden('Your account has been suspended by the university administrator. Please contact registrar support.');
    }
    if (user.accountStatus === 'deactivated') {
      // Reactivate on login
      user.accountStatus = 'active';
    }

    user.lastLoginAt = new Date();
    if (picture && !user.avatarUrl) {
      user.avatarUrl = picture;
    }
    await user.save();
  }

  const token = signToken(user);
  return { token, user: user.toJSON(), isNew };
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return vague success response to prevent email enumeration
    return { message: 'If an account exists with this email, password reset instructions have been issued.' };
  }

  // 1. Generate 32-byte cryptographic random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash token with SHA-256 before saving to DB
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  // Dispatch real transactional reset email
  const resetUrl = `${env.CLIENT_ORIGIN}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail({
    to: user.email,
    studentName: user.name,
    resetUrl
  });

  return {
    message: 'If an account exists with this email, password reset instructions have been issued.',
    ...(env.NODE_ENV !== 'production' ? { resetToken } : {})
  };
}

export async function resetPassword(token, newPassword) {
  const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw ApiError.badRequest('Password reset token is invalid or has expired');
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = newHash;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // Increment tokenVersion: immediately invalidates all active sessions across all devices
  user.tokenVersion = (user.tokenVersion || 1) + 1;
  await user.save();

  const newToken = signToken(user);
  return {
    message: 'Password reset successful. All active sessions have been invalidated.',
    token: newToken,
    user: user.toJSON()
  };
}

export async function revokeUserSessions(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  user.tokenVersion = (user.tokenVersion || 1) + 1;
  await user.save();
  return { message: 'All user sessions revoked successfully' };
}
