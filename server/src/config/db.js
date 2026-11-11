import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

function sanitizeUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

export async function connectDB(uri = env.MONGODB_URI) {
  const isProduction = env.NODE_ENV === 'production';
  const isLocalhostUri = /^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(uri);

  // If in production and MONGODB_URI is localhost or unset, log prominent notice
  if (isProduction && isLocalhostUri && !process.env.MONGODB_URI) {
    console.warn('\n================================================================');
    console.warn('[DSU DATABASE NOTICE] MONGODB_URI is not set in Render environment.');
    console.warn('To enable persistent cloud storage, set MONGODB_URI in Render Dashboard:');
    console.warn('e.g. mongodb+srv://<user>:<password>@<cluster>.mongodb.net/dsu_events');
    console.warn('================================================================\n');
  }

  // 1. Primary Authoritative Database Connection
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isProduction ? (isLocalhostUri ? 3000 : 30000) : 2500,
      connectTimeoutMS: 30000,
      maxPoolSize: isProduction ? 100 : 30,
      minPoolSize: isProduction ? 2 : 1,
      socketTimeoutMS: 45000,
      autoIndex: !isProduction
    });

    console.log(`[Database] Authoritative database connected at ${sanitizeUri(uri)} (Pool: ${isProduction ? 100 : 30})`);
    
    // Auto-seed baseline institutional data only if empty
    const { seedIfEmpty } = await import('../scripts/autoSeed.js');
    await seedIfEmpty();

    return conn;
  } catch (err) {
    console.error(`[Database Error] Primary connection failed: ${err.message}`);

    // If fallback is enabled (ALLOW_LOCAL_FALLBACK=true or in development/test),
    // initialize isolated local engine to keep platform responsive
    const allowFallback = env.ALLOW_LOCAL_FALLBACK || env.NODE_ENV !== 'production';

    if (allowFallback) {
      console.warn(`[Database Warning] Operating in resilient fallback mode. Initializing isolated local engine...`);
      try {
        let systemBinary = process.env.MONGOMS_SYSTEM_BINARY;
        if (!systemBinary) {
          const fs = await import('fs');
          const path = await import('path');
          const candidatePaths = [
            path.resolve(process.cwd(), 'node_modules/.cache/mongodb-memory-server/mongod-arm64-darwin-8.2.6'),
            path.resolve(process.cwd(), '../node_modules/.cache/mongodb-memory-server/mongod-arm64-darwin-8.2.6'),
          ];
          for (const cPath of candidatePaths) {
            if (fs.existsSync(cPath)) {
              systemBinary = cPath;
              process.env.MONGOMS_SYSTEM_BINARY = cPath;
              break;
            }
          }
        }
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!memoryServer) {
          memoryServer = await MongoMemoryServer.create({
            ...(systemBinary ? { binary: { systemBinary } } : {}),
            instance: {
              dbName: 'dsu_events'
            }
          });
        }

        const localUri = memoryServer.getUri();
        const conn = await mongoose.connect(localUri);
        console.log(`[Database] Isolated local engine online at ${localUri}`);

        const { seedIfEmpty } = await import('../scripts/autoSeed.js');
        await seedIfEmpty();

        return conn;
      } catch (localErr) {
        console.error('[Database FATAL] Isolated local engine failed:', localErr.message);
        throw localErr;
      }
    }

    throw err;
  }
}

export async function checkDatabaseHealth() {
  const state = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  if (state !== 1) {
    return {
      status: 'unhealthy',
      connected: false,
      readyState: state,
      message: 'Database connection is not in ready state'
    };
  }

  try {
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingMs = Date.now() - startTime;
    return {
      status: 'healthy',
      connected: true,
      readyState: 1,
      pingMs,
      databaseName: mongoose.connection.name
    };
  } catch (err) {
    return {
      status: 'degraded',
      connected: false,
      error: err.message
    };
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
