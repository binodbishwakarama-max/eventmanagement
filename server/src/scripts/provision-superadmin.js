import readline from 'node:readline';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=');
      args[key] = val || true;
    }
  }
  return args;
}

export async function bootstrapSuperAdmin(options = {}) {
  const args = { ...parseArgs(), ...options };
  const targetEmail = (args.email || process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();

  if (!targetEmail) {
    console.error('\n❌ [Security Error] Target email is required.');
    console.error('Usage: npm run admin:bootstrap -- --email=operator@dsu.edu.in');
    console.error('Or:    node server/src/scripts/provision-superadmin.js --email=operator@dsu.edu.in\n');
    process.exit(1);
  }

  console.log(`\n================================================================`);
  console.log(`🛡️  DSU CAMPUS EVENTS — SUPER ADMINISTRATOR SECURE BOOTSTRAP`);
  console.log(`================================================================`);
  console.log(`[Bootstrap] Target Email: ${targetEmail}`);
  console.log(`[Bootstrap] Timestamp:    ${new Date().toISOString()}`);
  console.log(`[Bootstrap] Environment:  ${env.NODE_ENV}`);

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    await mongoose.connect(env.MONGODB_URI);
  }

  try {
    // 1. One-Time Guard: Check for existing Super Administrator
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin && existingSuperAdmin.email !== targetEmail && !args.force) {
      console.error(`\n⚠️  [Security Warning] An active Super Administrator already exists: ${existingSuperAdmin.email}`);
      console.error('To assign an additional super administrator, pass --force explicitly.');
      console.error('Operation aborted to prevent unauthorized privilege takeover.\n');
      process.exit(1);
    }

    // 2. Locate target user account
    let targetUser = await User.findOne({ email: targetEmail });

    if (!targetUser) {
      console.warn(`\n[Notice] No existing account found for ${targetEmail}.`);
      console.log('For zero-trust security, the user should first sign in via Google SSO.');
      console.log('Creating initial verified administrative shell account for Google SSO linking...');

      targetUser = await User.create({
        name: args.name || 'University Super Administrator',
        email: targetEmail,
        role: 'super_admin',
        isVerified: true,
        isEmailVerified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        department: 'University Administration & Governance',
        accountStatus: 'active',
        tokenVersion: 1
      });

      console.log(`✅ [Success] Shell account provisioned with SUPER_ADMIN role.`);
      console.log(`When ${targetEmail} signs in with Google, it will automatically link with root privileges.`);
    } else {
      const priorRole = targetUser.role;
      targetUser.role = 'super_admin';
      targetUser.isVerified = true;
      targetUser.verificationStatus = 'verified';
      targetUser.accountStatus = 'active';
      targetUser.verifiedAt = targetUser.verifiedAt || new Date();
      targetUser.tokenVersion = (targetUser.tokenVersion || 1) + 1; // Invalidate all prior lower-privileged sessions
      await targetUser.save();

      console.log(`✅ [Success] Account ${targetEmail} promoted from [${priorRole}] to [SUPER_ADMIN].`);
      console.log(`[Security] Token version incremented: all prior active sessions invalidated.`);
    }

    console.log(`\n[Audit Trail] SUPER_ADMIN bootstrap operation logged for ${targetEmail}.`);
    console.log(`================================================================\n`);
  } finally {
    if (shouldDisconnect) {
      await mongoose.disconnect();
    }
  }
}

if (process.argv[1]?.endsWith('provision-superadmin.js')) {
  bootstrapSuperAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ [Fatal Error] Super Admin bootstrap failed:', err.message);
      process.exit(1);
    });
}
