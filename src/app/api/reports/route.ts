// src/app/api/reports/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaReplica } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/roleGuard';
import { createReportSchema } from '@/lib/validation';

// ======================= GET /api/reports =======================
export async function GET(req: NextRequest) {
  try {
    const mode = (req.nextUrl.searchParams.get('mode') || 'strong') as
      | 'strong'
      | 'eventual'
      | 'weak';

    const status = req.nextUrl.searchParams.get('status') || undefined;
    const kategori = req.nextUrl.searchParams.get('kategori') || undefined;
    const isAdminList = req.nextUrl.searchParams.get('admin') === '1';

    // pagination params (default limit 10 biar ringan dan LCP rendah)
    const pageParam = req.nextUrl.searchParams.get('page');
    const limitParam = req.nextUrl.searchParams.get('limit');

    const page = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(limitParam || '10', 10) || 10, 5),
      50
    );

    const skip = (page - 1) * limit;

    // auth: kalau admin=1 wajib admin, kalau tidak cukup user biasa
    const user = isAdminList ? await requireAdmin(req) : await requireAuth(req);

    // TEKNISI tidak boleh akses endpoint ini sesuai RBAC
    if (user.role === 'TEKNISI') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // pilih DB client berdasarkan mode
    const client = mode === 'strong' ? prisma : prismaReplica ?? prisma;

    const where: any = {};
    if (status) where.status = status;
    if (kategori) where.kategori = kategori;

    // user biasa hanya lihat laporan milik sendiri
    if (!isAdminList) {
      where.userId = user.id;
    }

    const [total, reports] = await Promise.all([
      client.laporanFasilitas.count({ where }),
      client.laporanFasilitas.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          kategori: true,
          judul: true,
          deskripsi: true,
          fotoUrl: true,
          prioritas: true,
          status: true,
          lokasi: true,
          createdAt: true,
          assignedToId: true,
          user: {
            select: {
              namaLengkap: true,
              nomorKamar: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return NextResponse.json(
      {
        reports,
        mode,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Reports GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ======================= POST /api/reports =======================
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    let raw: any = null;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Body tidak valid (bukan JSON)' },
        { status: 400 }
      );
    }

    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 });
    }

    // Jika lokasi kosong → default dari nomorKamar user
    if (!raw.lokasi || typeof raw.lokasi !== 'string' || raw.lokasi.trim() === '') {
      raw.lokasi = user.nomorKamar || 'Tidak diketahui';
    }

    const parsed = createReportSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      console.error('Create report validation error:', flat);
      return NextResponse.json({ error: 'Invalid input', details: flat }, { status: 400 });
    }

    const data = parsed.data;
    const now = new Date();

    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.laporanFasilitas.create({
        data: {
          userId: user.id,
          kategori: data.kategori,
          judul: data.judul,
          deskripsi: data.deskripsi,
          fotoUrl: data.fotoUrl && data.fotoUrl !== '' ? data.fotoUrl : null,
          prioritas: data.prioritas,
          lokasi: data.lokasi,
        },
      });

      await tx.laporanEvent.create({
        data: {
          laporanId: created.id,
          actorId: user.id,
          type: 'REPORTED',
          note: 'Penghuni membuat laporan.',
          at: now,
        },
      });

      return created;
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    console.error('Reports POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
