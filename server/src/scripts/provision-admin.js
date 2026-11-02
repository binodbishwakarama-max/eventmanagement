import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export async function provisionAdmin() {
  if (env.ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters for administrator provisioning');
  }

  await mongoose.connect(env.MONGODB_URI);
  try {
    const existing = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      if (existing.role !== 'admin') {
        throw new Error('The configured administrator email already belongs to a non-admin account');
      }
      console.log(`Administrator already provisioned: ${existing.email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await User.create({
      name: 'Administrator',
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: 'admin'
    });
    console.log(`Administrator provisioned: ${env.ADMIN_EMAIL.toLowerCase()}`);
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1]?.endsWith('provision-admin.js')) {
  provisionAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Administrator provisioning failed:', error.message);
      process.exit(1);
    });
}
