import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  personalNumber: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  bahadRole: z.string().min(2).max(120),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
