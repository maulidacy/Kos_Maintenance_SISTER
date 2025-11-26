import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// getCurrentUser boleh pakai prisma dengan dynamic import,
// tapi ini tidak dipakai di /api/auth/register /login,
// jadi aman dari error saat register/login
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload) return null;

  const { prisma } = await import('./prisma');

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) return null;
  return user;
}
