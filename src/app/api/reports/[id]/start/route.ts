// src/app/api/reports/[id]/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTeknisi } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const teknisi = await requireTeknisi(req);
    const { id: reportId } = await context.params;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID tidak ditemukan.' }, { status: 400 });
    }

    const report = await prisma.laporanFasilitas.findUnique({
      where: { id: reportId },
      select: { id: true, status: true, assignedToId: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    if (report.assignedToId !== teknisi.id) {
      return NextResponse.json(
        { error: 'Laporan ini bukan tugas kamu.' },
        { status: 403 }
      );
    }

    if (report.status !== 'DIPROSES') {
      return NextResponse.json(
        { error: 'Start hanya bisa dilakukan saat status DIPROSES.' },
        { status: 400 }
      );
    }

    const updated = await prisma.laporanFasilitas.update({
      where: { id: reportId },
      data: {
        status: 'DIKERJAKAN',
        startedAt: new Date(),
        events: {
          create: {
            actorId: teknisi.id,
            type: 'STARTED',
            note: 'Teknisi mulai mengerjakan laporan.',
          },
        },
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
      },
    });

    return NextResponse.json({ ok: true, report: updated }, { status: 200 });
  } catch (err: any) {
    console.error('Start report error:', err);

    if (err?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
