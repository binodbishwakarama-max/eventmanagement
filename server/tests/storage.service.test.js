import { describe, expect, it } from 'vitest';
import { validateMagicBytes, storePosterImage } from '../src/services/storage/storage.service.js';

describe('Storage Service & Poster Upload Verification', () => {
  it('validates binary magic bytes for JPEG, PNG, and WebP', () => {
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const validWebp = Buffer.from('RIFF....WEBP');
    const fakeFile = Buffer.from('NOT AN IMAGE FILE HEADER');

    expect(validateMagicBytes(validJpeg, 'image/jpeg')).toBe(true);
    expect(validateMagicBytes(validPng, 'image/png')).toBe(true);
    expect(validateMagicBytes(validWebp, 'image/webp')).toBe(true);
    expect(validateMagicBytes(fakeFile, 'image/jpeg')).toBe(false);
    expect(validateMagicBytes(fakeFile, 'image/png')).toBe(false);
  });

  it('rejects oversized files exceeding 5MB quota', async () => {
    const fakeOversizedFile = {
      size: 6 * 1024 * 1024,
      type: 'image/jpeg',
      name: 'huge.jpg',
      arrayBuffer: async () => new ArrayBuffer(0)
    };

    await expect(storePosterImage(fakeOversizedFile)).rejects.toThrow('File size exceeds');
  });

  it('rejects unapproved MIME types', async () => {
    const fakePdfFile = {
      size: 1024,
      type: 'application/pdf',
      name: 'doc.pdf',
      arrayBuffer: async () => new ArrayBuffer(1024)
    };

    await expect(storePosterImage(fakePdfFile)).rejects.toThrow('Invalid file type');
  });

  it('stores valid JPEG with magic bytes to durable storage and returns valid URL', async () => {
    const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const validFile = {
      size: validJpegBuffer.length,
      type: 'image/jpeg',
      name: 'campus-poster.jpg',
      arrayBuffer: async () => validJpegBuffer.buffer.slice(validJpegBuffer.byteOffset, validJpegBuffer.byteOffset + validJpegBuffer.byteLength)
    };

    const result = await storePosterImage(validFile);
    expect(result).toHaveProperty('url');
    expect(result.url).toMatch(/^\/uploads\/posters\/poster-/);
    expect(result.size).toBe(validJpegBuffer.length);
    expect(result.mimeType).toBe('image/jpeg');
  });
});

