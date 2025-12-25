// src/app/api/reports/[id]/receive/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);

    // Next 15: params harus di-await
    const { id: reportId } = await context.params;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID tidak ditemukan di params.' },
        { status: 400 }
      );
    }

    const report = await prisma.laporanFasilitas.findUnique({
      where: { id: reportId },
      select: { id: true, status: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (report.status !== 'BARU') {
      return NextResponse.json(
        { error: 'Laporan sudah diproses, tidak bisa di-receive lagi.' },
        { status: 400 }
      );
    }

    const updated = await prisma.laporanFasilitas.update({
      where: { id: reportId },
      data: {
        status: 'DIPROSES',
        receivedAt: new Date(),
        events: {
          create: {
            actorId: admin.id,
            type: 'RECEIVED',
            note: 'Admin menerima laporan.',
          },
        },
      },
      select: {
        id: true,
        status: true,
        receivedAt: true,
      },
    });

    return NextResponse.json({ ok: true, report: updated }, { status: 200 });
  } catch (err: any) {
    console.error('Receive report error:', err);

    if (err?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
