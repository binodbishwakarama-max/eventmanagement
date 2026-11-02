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

export async function createDatabaseBackup(customUri = null) {
  const uri = customUri || env.MONGODB_URI;
  console.log(`[Backup Engine] Connecting to database for backup...`);

  const conn = mongoose.connection.readyState === 1
    ? mongoose.connection
    : await mongoose.connect(uri);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(BACKUPS_DIR, `backup_${timestamp}`);
  await fs.mkdir(backupFolder, { recursive: true });

  const collections = [
    { name: 'users', model: User },
    { name: 'events', model: Event },
    { name: 'registrations', model: Registration }
  ];

  const manifest = {
    schemaVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    environment: env.NODE_ENV,
    databaseName: conn.name || 'dsu_events',
    collections: {}
  };

  for (const col of collections) {
    const docs = await col.model.find({}).lean();
    const jsonStr = JSON.stringify(docs, null, 2);
    const checksum = crypto.createHash('sha256').update(jsonStr).digest('hex');

    const filePath = path.join(backupFolder, `${col.name}.json`);
    await fs.writeFile(filePath, jsonStr, 'utf8');

    manifest.collections[col.name] = {
      count: docs.length,
      file: `${col.name}.json`,
      sha256: checksum
    };

    console.log(`  ✔ [Exported] ${col.name}: ${docs.length} records (Checksum: ${checksum.slice(0, 8)}...)`);
  }

  const manifestPath = path.join(backupFolder, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`[Backup Engine] Backup completed successfully.`);
  console.log(`[Backup Engine] Destination: ${backupFolder}`);

  return { backupFolder, manifest };
}

if (process.argv[1]?.endsWith('backup-db.js')) {
  createDatabaseBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Backup Engine FATAL]', err.message);
      process.exit(1);
    });
}

