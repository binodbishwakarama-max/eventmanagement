import { z } from 'zod';

const clientEnvSchema = z.object({
  VITE_API_URL: z.string().default('/api'),
  VITE_DEMO_MODE: z.enum(['true', 'false']).default('false'),
});

const parsed = clientEnvSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL || '/api',
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE ?? 'false',
});

if (!parsed.success) {
  console.error('Invalid client environment variables:', parsed.error.format());
  throw new Error('Invalid client environment configuration. Check your .env file.');
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  isDemoMode: parsed.data.VITE_DEMO_MODE === 'true',
};

export default env;

