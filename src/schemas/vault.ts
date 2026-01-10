import { z } from 'zod';

export const vaultTypeSchema = z.enum([
  'password',
  'note',
  'link',
  'transaction_screenshot',
  'password_screenshot',
  'image',
]);

export const passwordDataSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const noteDataSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

export const linkDataSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  description: z.string().optional(),
});

export const imageDataSchema = z.object({
  description: z.string().optional(),
  filename: z.string(),
});

export const createPasswordEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  type: z.literal('password'),
  data: passwordDataSchema,
  tags: z.array(z.string()).optional(),
});

export const createNoteEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  type: z.literal('note'),
  data: noteDataSchema,
  tags: z.array(z.string()).optional(),
});

export const createLinkEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  type: z.literal('link'),
  data: linkDataSchema,
  tags: z.array(z.string()).optional(),
});

export const createImageEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  type: z.enum(['image', 'transaction_screenshot', 'password_screenshot']),
  data: imageDataSchema,
  tags: z.array(z.string()).optional(),
});

export const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AuthFormData = z.infer<typeof authSchema>;
