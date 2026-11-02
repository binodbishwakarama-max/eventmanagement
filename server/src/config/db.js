import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

function sanitizeUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

export async function connectDB(uri = env.MONGODB_URI) {
  const isProduction = env.NODE_ENV === 'production';

  // 1. Primary Authoritative Database Connection
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isProduction ? 8000 : 2500,
      maxPoolSize: isProduction ? 50 : 20,
      minPoolSize: isProduction ? 5 : 1,
      socketTimeoutMS: 45000,
      autoIndex: !isProduction
    });

    console.log(`[Database] Authoritative database connected at ${sanitizeUri(uri)} (Pool: ${isProduction ? 50 : 20})`);
    
    // Auto-seed baseline institutional data only if empty
    const { seedIfEmpty } = await import('../scripts/autoSeed.js');
    await seedIfEmpty();

    return conn;
  } catch (err) {
    console.error(`[Database Error] Primary connection failed: ${err.message}`);

    // PRIORITY 1: PRODUCTION SPLIT-BRAIN DEFENSE
    // In production, local in-memory fallback is strictly prohibited to prevent data divergence.
    if (isProduction) {
      console.error('[Database FATAL] SPLIT-BRAIN PREVENTION: Writes cannot be diverted to local storage in production.');
      throw new Error(`Authoritative production database unavailable: ${err.message}`);
    }

    // 2. Development & Testing Isolated Fallback ONLY
    if (env.ALLOW_LOCAL_FALLBACK || env.NODE_ENV === 'test' || env.NODE_ENV === 'development') {
      console.warn(`[Database Warning] Operating in ${env.NODE_ENV} mode. Initializing isolated local development engine...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'dsu_events'
          }
        });

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
