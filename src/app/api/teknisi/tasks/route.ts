// src/app/api/teknisi/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTeknisi } from '@/lib/roleGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const teknisi = await requireTeknisi(req);

    const tab = req.nextUrl.searchParams.get('tab'); 
    const status = req.nextUrl.searchParams.get('status');
    const prioritas = req.nextUrl.searchParams.get('prioritas');
    const kategori = req.nextUrl.searchParams.get('kategori');

    const where: any = {
      assignedToId: teknisi.id,
    };

    // tab filter
    if (tab === 'AKTIF') {
      where.status = { in: ['DIPROSES', 'DIKERJAKAN'] };
    } else if (tab === 'SELESAI') {
      where.status = 'SELESAI';
    }

    // filter tambahan
    if (status) where.status = status;
    if (prioritas) where.prioritas = prioritas;
    if (kategori) where.kategori = kategori;

    const tasks = await prisma.laporanFasilitas.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        judul: true,
        kategori: true,
        prioritas: true,
        status: true,
        lokasi: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (err: any) {
    console.error('GET /teknisi/tasks error:', err);

    if (err?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
