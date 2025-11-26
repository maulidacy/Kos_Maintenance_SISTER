import { z } from 'zod';

export const registerSchema = z.object({
  namaLengkap: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  nomorKamar: z.string().max(20).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
