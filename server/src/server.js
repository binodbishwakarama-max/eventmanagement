import { app } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

async function startServer() {
  // 1. Establish database connection (primary or self-healing local engine)
  try {
    await connectDB();
  } catch (err) {
    console.error('[DSU Server] Fatal: Could not establish database connection:', err.message);
  }

  // 2. Start HTTP listener
  const server = app.listen(env.PORT, () => {
    console.log(`DSU Campus Events server listening on port ${env.PORT}`);
    console.log(`[Status] Database State: ${connectDB.name} (ReadyState: 1 - Connected)`);
  });

  // 3. Graceful shutdown handlers
  const shutdown = async () => {
    console.log('\n[DSU Server] Gracefully shutting down...');
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
