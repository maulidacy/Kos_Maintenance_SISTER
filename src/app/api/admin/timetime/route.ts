export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const reports = await prisma.laporanFasilitas.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        judul: true,
        lokasi: true,
        status: true,
        createdAt: true,
        receivedAt: true,
        startedAt: true,
        resolvedAt: true,
      },
    });

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED')
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    if (error?.message === 'FORBIDDEN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    console.error('Timetime API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
