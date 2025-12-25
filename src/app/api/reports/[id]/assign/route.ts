// src/app/api/reports/[id]/assign/route.ts
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

    const body = await req.json().catch(() => null);
    const teknisiId = body?.teknisiId as string | undefined;

    console.log("ASSIGN HIT", reportId, teknisiId);

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID tidak ditemukan.' }, { status: 400 });
    }

    if (!teknisiId) {
      return NextResponse.json({ error: 'teknisiId wajib diisi.' }, { status: 400 });
    }

    // cek teknisi valid
    const teknisi = await prisma.user.findUnique({
      where: { id: teknisiId },
      select: { id: true, role: true },
    });

    if (!teknisi || teknisi.role !== 'TEKNISI') {
      return NextResponse.json({ error: 'Teknisi tidak valid.' }, { status: 400 });
    }

    // cek report valid
    const report = await prisma.laporanFasilitas.findUnique({
      where: { id: reportId },
      select: { id: true, status: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    if (report.status !== 'DIPROSES') {
      return NextResponse.json(
        { error: 'Assign hanya bisa saat status DIPROSES.' },
        { status: 400 }
      );
    }

    // update assignedToId + log event
    const updated = await prisma.laporanFasilitas.update({
      where: { id: reportId },
      data: {
        assignedToId: teknisiId,
        events: {
          create: {
            actorId: admin.id,
            type: 'ASSIGNED',
            note: `Admin assign teknisi (${teknisiId}).`,
          },
        },
      },
      select: {
        id: true,
        status: true,
        assignedToId: true,
      },
    });

    return NextResponse.json({ ok: true, report: updated }, { status: 200 });

  } catch (err: any) {
    console.error('Assign report error:', err);

    if (err?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
