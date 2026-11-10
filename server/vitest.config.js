import { defineConfig } from 'vitest/config';
import path from 'path';

const binaryPath = path.resolve(__dirname, '../node_modules/.cache/mongodb-memory-server/mongod-arm64-darwin-8.2.6');
process.env.MONGOMS_SYSTEM_BINARY = binaryPath;

export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
