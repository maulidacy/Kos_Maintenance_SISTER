import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);

  return NextResponse.json({
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
          namaLengkap: user.namaLengkap,
        }
      : null,
  });
}
