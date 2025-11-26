import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { NextRequest } from 'next/server';
import { prisma } from './prisma';

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

/**
 * Ambil user dari JWT cookie "token" yang ada di NextRequest.
 */
export async function getCurrentUser(req: NextRequest) {
  // Ambil cookie "token" dari request
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) return null;
  return user;
}
