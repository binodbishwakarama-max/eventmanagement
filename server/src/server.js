import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

let reconnectTimer = null;

async function startServer() {
  // 1. Establish database connection (primary or self-healing local engine)
  try {
    await connectDB();
  } catch (err) {
    console.error('[DSU Server] Initial database connection warning:', err.message);
  }

  // 2. Continuous reconnection guard if not yet connected
  if (mongoose.connection.readyState !== 1) {
    console.warn('[DSU Server] Background database reconnection monitor activated.');
    reconnectTimer = setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(reconnectTimer);
        return;
      }
      try {
        console.log('[DSU Server] Retrying database connection...');
        await connectDB();
        console.log('[DSU Server] Database successfully connected in background.');
        clearInterval(reconnectTimer);
      } catch (retryErr) {
        // Will retry on next interval tick
      }
    }, 15000);
    reconnectTimer.unref();
  }

  // Monitor disconnects after successful connection
  mongoose.connection.on('disconnected', () => {
    console.warn('[DSU Server] Database connection lost. Attempting reconnection...');
    connectDB().catch((err) => {
      console.warn('[DSU Server] Reconnection attempt failed:', err.message);
    });
  });

  // 3. Start HTTP listener
  const server = app.listen(env.PORT, () => {
    console.log(`DSU Campus Events server listening on port ${env.PORT}`);
    console.log(`[Status] Database State: ReadyState ${mongoose.connection.readyState} (${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected / Pending'})`);
  });

  // 4. Graceful shutdown handlers
  const shutdown = async () => {
    console.log('\n[DSU Server] Gracefully shutting down...');
    if (reconnectTimer) clearInterval(reconnectTimer);
    server.close(async () => {
      await disconnectDB();
      console.log('[DSU Server] Server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

startServer();
