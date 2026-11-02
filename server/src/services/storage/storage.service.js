import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_UPLOAD_DIR = path.resolve(__dirname, '../../../uploads/posters');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

/**
 * Binary magic byte validation to prevent mime-type spoofing
 */
export function validateMagicBytes(buffer, mimeType) {
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mimeType === 'image/webp') {
    const riff = buffer.toString('utf8', 0, 4);
    const webp = buffer.toString('utf8', 8, 12);
    return riff === 'RIFF' && webp === 'WEBP';
  }
  return false;
}

/**
 * Cloudinary Direct Upload using Node native fetch
 */
async function uploadToCloudinary(buffer, filename, mimeType) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw ApiError.internal('Cloudinary storage is configured but API credentials are missing from environment.');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'dsu_events/posters';
  
  // Create Cloudinary signature: folder=...&timestamp=...<secret>
  const signatureString = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const formData = new URLSearchParams();
  formData.append('file', base64Data);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Cloudinary Upload Error]', errText);
    throw ApiError.internal('Failed to persist event poster to Cloudinary CDN.');
  }

  const result = await response.json();
  return {
    url: result.secure_url,
    filename: result.public_id,
    size: buffer.length,
    mimeType,
    provider: 'cloudinary'
  };
}

/**
 * Local Filesystem Driver
 */
async function uploadToLocal(buffer, mimeType) {
  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

  const ext = EXT_MAP[mimeType] || 'jpg';
  const filename = `poster-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const destination = path.join(LOCAL_UPLOAD_DIR, filename);

  await fs.writeFile(destination, buffer);

  return {
    url: `/uploads/posters/${filename}`,
    filename,
    size: buffer.length,
    mimeType,
    provider: 'local'
  };
}

/**
 * Master Upload Coordinator with Development & Production Separation
 */
export async function storePosterImage(file) {
  if (!file || typeof file === 'string') {
    throw ApiError.badRequest('No poster file uploaded under form field "file" or "poster"');
  }

  // 1. Enforce 5MB limit
  const maxBytes = (env.MAX_UPLOAD_SIZE_MB || 5) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw ApiError.badRequest(`File size exceeds the ${env.MAX_UPLOAD_SIZE_MB}MB limit`);
  }

  // 2. Enforce MIME type whitelist
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw ApiError.badRequest('Invalid file type. Only JPEG, PNG, and WebP images are permitted');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    throw ApiError.badRequest('Uploaded file is empty');
  }

  // 3. Header sniffing / Magic bytes defense
  if (!validateMagicBytes(buffer, file.type)) {
    throw ApiError.badRequest('Corrupted image or mismatched file header signature');
  }

  // 4. Provider Selection & Environment Separation
  // In production, prioritize Cloudinary if credentials are present, else fallback safely to local
  const provider = env.STORAGE_PROVIDER;
  const hasCloudinary = env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

  if (provider === 'cloudinary' || (env.NODE_ENV === 'production' && hasCloudinary)) {
    try {
      console.log('[Storage] Routing poster upload to Cloudinary CDN...');
      return await uploadToCloudinary(buffer, file.name || 'poster', file.type);
    } catch (err) {
      console.error('[Storage Warning] Cloudinary upload failed, falling back to durable local storage:', err.message);
      return await uploadToLocal(buffer, file.type);
    }
  }

  // Default for development & test
  return await uploadToLocal(buffer, file.type);
}

