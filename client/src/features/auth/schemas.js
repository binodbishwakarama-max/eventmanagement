import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid institutional email')
    .refine(
      (val) => val.endsWith('@dsu.edu.in') || val.endsWith('@example.test'),
      'Must use official Dayananda Sagar University email (@dsu.edu.in)'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  usn: z
    .string()
    .min(1, 'University Seat Number (USN) is required')
    .regex(/^1DS\d{2}[A-Z]{2,3}\d{3}$/i, 'Invalid DSU USN format (e.g., 1DS23CS045)'),
  department: z
    .string()
    .min(1, 'Department / School of study is required')
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid institutional email')
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

