// src/app/api/reports/[id]/reject/route.ts
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
    const { id: reportId } = await context.params;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID tidak ditemukan.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    const note = body?.note as string | undefined;

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

    // ✅ hanya bisa reject kalau belum selesai
    if (report.status === 'SELESAI') {
      return NextResponse.json(
        { error: 'Laporan sudah selesai, tidak bisa ditolak.' },
        { status: 400 }
      );
    }

    if (report.status === 'DITOLAK') {
      return NextResponse.json(
        { error: 'Laporan sudah ditolak.' },
        { status: 400 }
      );
    }

    const updated = await prisma.laporanFasilitas.update({
      where: { id: reportId },
      data: {
        status: 'DITOLAK',
        events: {
          create: {
            actorId: admin.id,
            type: 'STATUS_CHANGED', // ✅ pakai enum yang sudah ada
            note: note?.trim()
              ? `Admin menolak laporan: ${note}`
              : 'Admin menolak laporan.',
          },
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json({ ok: true, report: updated }, { status: 200 });

  } catch (err: any) {
    console.error('Reject report error:', err);

    if (err?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
