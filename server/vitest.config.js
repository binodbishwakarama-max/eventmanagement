import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const binaryPath = path.resolve(__dirname, '../node_modules/.cache/mongodb-memory-server/mongod-arm64-darwin-8.2.6');
process.env.MONGOMS_SYSTEM_BINARY = binaryPath;

export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
