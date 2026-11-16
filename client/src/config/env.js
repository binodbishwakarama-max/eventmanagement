import { z } from 'zod';

const clientEnvSchema = z.object({
  VITE_API_URL: z.string().default('/api'),
  VITE_DEMO_MODE: z.enum(['true', 'false']).default('false'),
  VITE_GOOGLE_CLIENT_ID: z.string().optional()
});

const parsed = clientEnvSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL || '/api',
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE ?? 'false',
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID
});

if (!parsed.success) {
  console.error('Invalid client environment variables:', parsed.error.format());
  throw new Error('Invalid client environment configuration. Check your .env file.');
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  isDemoMode: parsed.data.VITE_DEMO_MODE === 'true',
  googleClientId: parsed.data.VITE_GOOGLE_CLIENT_ID
};

export default env;
