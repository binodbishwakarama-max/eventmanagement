import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in server directory or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/dsu_events'),
  ALLOW_LOCAL_FALLBACK: z.coerce.boolean().default(true), // Strictly ignored in production
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  ADMIN_EMAIL: z.string().email().default('admin@example.test'),
  ADMIN_PASSWORD: z.string().min(8),
  STORAGE_PROVIDER: z.enum(['local', 's3', 'cloudinary']).default('local'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(5),
  // Cloudinary configuration (optional in dev, used when STORAGE_PROVIDER=cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // AWS S3 / GCS configuration (optional in dev, used when STORAGE_PROVIDER=s3)
  AWS_BUCKET_NAME: z.string().optional(),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  // Email delivery configuration
  EMAIL_PROVIDER: z.enum(['mock', 'smtp', 'sendgrid']).default('mock'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('DSU Campus Events <no-reply@dsu.edu.in>'),
  SENDGRID_API_KEY: z.string().optional(),
  // Optional Error Monitoring
  SENTRY_DSN: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[Config] Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
