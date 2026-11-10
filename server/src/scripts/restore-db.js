import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.resolve(__dirname, '../../backups');

export async function restoreDatabaseBackup(backupFolderName, targetUri = null) {
  const uri = targetUri || env.MONGODB_URI;
  const isProduction = env.NODE_ENV === 'production';

  if (isProduction && process.env.CONFIRM_PRODUCTION_RESTORE !== 'true') {
    throw new Error(
      'DISASTER RECOVERY SAFETY: Overwriting a production database requires CONFIRM_PRODUCTION_RESTORE=true.'
    );
  }

  const backupPath = path.isAbsolute(backupFolderName)
    ? backupFolderName
    : path.join(BACKUPS_DIR, backupFolderName);

  console.log(`[Restore Engine] Reading backup snapshot from: ${backupPath}`);
  const manifestPath = path.join(backupPath, 'manifest.json');
  const manifestRaw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  console.log(`[Restore Engine] Snapshot Created At: ${manifest.createdAt} (${manifest.environment})`);

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }

  const modelMap = {
    users: User,
    events: Event,
    registrations: Registration
  };

  const results = {};

  for (const [colName, meta] of Object.entries(manifest.collections)) {
    const filePath = path.join(backupPath, meta.file);
    const content = await fs.readFile(filePath, 'utf8');
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    if (checksum !== meta.sha256) {
      throw new Error(`Data corruption detected in ${meta.file}: Checksum mismatch!`);
    }

    const docs = JSON.parse(content);
    const model = modelMap[colName];
    if (!model) {
      console.warn(`[Restore Engine Warning] No model found for collection: ${colName}`);
      continue;
    }

    // Clear existing collection and restore snapshot
    await model.deleteMany({});
    if (docs.length > 0) {
      await model.insertMany(docs, { ordered: false });
    }

    const verifiedCount = await model.countDocuments();
    results[colName] = { restored: docs.length, verifiedInDatabase: verifiedCount };
    console.log(`  ✔ [Restored] ${colName}: ${verifiedCount} records verified in DB (Expected: ${meta.count})`);

    if (verifiedCount !== meta.count) {
      throw new Error(`Restoration record count mismatch for ${colName}: expected ${meta.count}, found ${verifiedCount}`);
    }
  }

  console.log(`[Restore Engine] Database restoration verified 100% successful.`);
  return { success: true, results };
}

if (process.argv[1]?.endsWith('restore-db.js')) {
  const targetFolder = process.argv[2];
  if (!targetFolder) {
    console.error('Usage: node restore-db.js <backup_folder_name>');
    process.exit(1);
  }
  restoreDatabaseBackup(targetFolder)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Restore Engine FATAL]', err.message);
      process.exit(1);
    });
}

